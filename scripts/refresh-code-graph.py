"""Rebuild the current project's AST-only graph after `graphify update .`.

No semantic extraction, model calls, Git commands or historical graph merging.
Use --output <workspace>/graphify-out for a read-only repository rehearsal.
"""

from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

import networkx as nx
from graphify.build import build_from_json
from graphify.export import to_html, to_json
from graphify.extract import extract


CODE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py"}
GENERATED_NAMES = {"next-env.d.ts"}


def source_paths(root: Path) -> list[Path]:
    paths = {
        path
        for path in root.iterdir()
        if path.is_file()
        and path.suffix in CODE_SUFFIXES
        and path.name not in GENERATED_NAMES
    }
    for dirname in ("src", "tests", "scripts"):
        directory = root / dirname
        if directory.is_dir():
            paths.update(
                path
                for path in directory.rglob("*")
                if path.is_file()
                and path.suffix in CODE_SUFFIXES
                and "__pycache__" not in path.parts
                and path.name not in GENERATED_NAMES
            )
    return sorted(paths, key=lambda path: path.relative_to(root).as_posix())


def relative_source(value: str, root: Path, allowed: set[str]) -> str | None:
    if not value:
        return None
    path = Path(value)
    resolved = path.resolve() if path.is_absolute() else (root / path).resolve()
    try:
        relative = resolved.relative_to(root).as_posix()
    except ValueError:
        return None
    return relative if relative in allowed and resolved.is_file() else None


def communities_for(graph: nx.DiGraph) -> dict[int, list[str]]:
    undirected = graph.to_undirected()
    if not undirected.number_of_edges():
        groups = [{node} for node in undirected.nodes]
    else:
        groups = nx.community.louvain_communities(undirected, seed=42)
    ordered = sorted((sorted(group) for group in groups), key=lambda group: (-len(group), group))
    return dict(enumerate(ordered))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / "package.json").is_file() or not (root / "src").is_dir():
        raise SystemExit("Expected a project root containing package.json and src/.")
    output = (args.output or root / "graphify-out").resolve()
    if output.name != "graphify-out":
        raise SystemExit("The output directory must be named graphify-out (Graphify's cache convention).")
    output.mkdir(parents=True, exist_ok=True)
    paths = source_paths(root)
    allowed = {path.relative_to(root).as_posix() for path in paths}
    if not paths:
        raise SystemExit("No current code files found; refusing to replace the graph with an empty graph.")

    # A fresh extraction merges only current files. Graphify's content-addressed
    # AST cache can be reused safely; its historical graph is never an input.
    extraction = extract(paths, cache_root=output.parent)
    nodes = []
    for raw in extraction["nodes"]:
        node = dict(raw)
        source = relative_source(node.get("source_file", ""), root, allowed)
        if node.get("file_type") != "code" or source is None:
            continue
        node.update(
            source_file=source,
            status="Current source code; AST extraction only",
            source_scope="Current minimal monitor-and-pond portfolio source",
        )
        nodes.append(node)
    ids = {node["id"] for node in nodes}
    if len(ids) != len(nodes):
        raise SystemExit("AST node IDs collide; inspect extraction before exporting.")
    edges = []
    for raw in extraction["edges"]:
        edge = dict(raw)
        source = relative_source(edge.get("source_file", ""), root, allowed)
        if edge.get("source") not in ids or edge.get("target") not in ids or source is None:
            continue
        edge["source_file"] = source
        edges.append(edge)
    graph = build_from_json({"nodes": nodes, "edges": edges}, directed=True)
    if not graph.number_of_nodes():
        raise SystemExit("AST extraction returned no current nodes; existing exports were not replaced.")
    communities = communities_for(graph)
    labels = {}
    for community, members in communities.items():
        file_counts = Counter(graph.nodes[node]["source_file"] for node in members)
        filenames = sorted(file_counts, key=lambda source: (-file_counts[source], source))
        labels[community] = " / ".join(Path(source).name for source in filenames[:3])
        if len(filenames) > 3:
            labels[community] += f" + {len(filenames) - 3} files"
        for node in members:
            graph.nodes[node]["community"] = community

    generated_at = datetime.now(timezone.utc).isoformat()
    fingerprints = [
        {"path": path.relative_to(root).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        for path in paths
    ]
    graph.graph.update(
        scope="Current source code only; AST extraction",
        generated_at=generated_at,
        algorithm="NetworkX Louvain, seed 42, undirected projection",
        community_labels=labels,
        source_files=fingerprints,
        hyperedges=[],
        limitations=[
            "No document or historical planning extraction is included.",
            "AST structure is not evidence of feature completeness or runtime behavior.",
            "JSX composition, framework routing and dynamic relationships may be missing.",
            "Some calls are inferred by name; confidence remains attached to each edge.",
        ],
    )
    to_json(graph, communities, str(output / "graph.json"))
    to_html(graph, communities, str(output / "graph.html"), community_labels=labels)
    html_path = output / "graph.html"
    page = html_path.read_text(encoding="utf-8")
    page = page.replace('onclick="focusNode(${JSON.stringify(nid)})"', 'onclick="focusNode(${esc(JSON.stringify(nid))})"')
    page = page.replace("<title>graphify</title>", "<title>folio-2026 — Current source graph</title>")
    html_path.write_text(page, encoding="utf-8")

    counts = Counter(data.get("confidence", "EXTRACTED") for _, _, data in graph.edges(data=True))
    report = [
        "# folio-2026 — Current source graph",
        "",
        "> Scope: Current application, test and project-configuration code only. This AST extraction does not prove feature completeness. Historical planning and deleted code are excluded; Git history preserves the earlier implementation.",
        "",
        "[Interactive graph](graph.html) · [Graph JSON](graph.json) · [Current README](../README.md)",
        "",
        f"Generated: {generated_at}",
        "",
        f"- {graph.number_of_nodes()} nodes · {graph.number_of_edges()} directed edges · {len(communities)} communities",
        f"- {len(paths)} current code files; repository-relative source paths with SHA-256 fingerprints",
        "- AST extraction only: no LLM calls or API cost",
        "- Clustering: NetworkX Louvain, seed 42, on the undirected projection",
        "- Edge confidence: " + (", ".join(f"{name}: {count}" for name, count in sorted(counts.items())) or "no edges"),
        "",
        "## Source navigation",
        "",
    ]
    for path in sorted(allowed):
        count = sum(data["source_file"] == path for _, data in graph.nodes(data=True))
        report.append(f"- [{path}](../{path}): {count} nodes")
    report.extend(["", "## Communities", ""])
    undirected = graph.to_undirected()
    for community, members in communities.items():
        density = nx.density(undirected.subgraph(members)) if len(members) > 1 else 0.0
        report.extend([
            f"### {community}: {labels[community]}",
            "",
            f"{len(members)} nodes · edge density {density:.2f}",
            "",
        ])
        for node in members:
            data = graph.nodes[node]
            label = str(data.get("label", node)).replace("`", "'")
            report.append(f"- `{label}` — {data['source_file']} {data.get('source_location', '')}".rstrip())
        report.append("")
    report.extend([
        "## Limits and audit",
        "",
        "- Every node refers to an existing, in-scope code file. Historical planning nodes, missing files and their edges are absent.",
        "- Node IDs and edge endpoints are validated. Relationship directions and confidence are preserved.",
        "- The extractor may omit JSX composition, framework routing and dynamic state relationships. A sparse or isolated node does not establish a defect.",
        "- Name-based call inference can produce false matches. Review the source before treating a connection as runtime evidence.",
        "- Community labels name source files; clustering and edge density are navigation aids, not quality measurements.",
        "- CSS, documents, binary assets and generated files are outside this graph's scope.",
        "- graph.html loads vis-network from unpkg and needs network access for its visualization library.",
        "",
    ])
    (output / "GRAPH_REPORT.md").write_text("\n".join(report), encoding="utf-8")
    audit = {
        "generated_at": generated_at,
        "scope": "Current source code only; AST extraction",
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "communities": len(communities),
        "code_files": len(paths),
        "planning_nodes": 0,
        "hyperedges": 0,
        "structurally_valid": len(ids) == graph.number_of_nodes() and all(u in ids and v in ids for u, v in graph.edges()),
        "edge_confidence": dict(counts),
        "source_files": fingerprints,
        "validation_scope": "Graph structure and source provenance; not implementation completeness",
    }
    (output / "audit.json").write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")
    cost = {
        "scope": "Latest current-code graph rebuild only",
        "generated_at": generated_at,
        "mode": "AST extraction; no LLM calls",
        "input_tokens": 0,
        "output_tokens": 0,
        "monetary_cost": 0,
        "historical_runs": "Excluded from this branch's graph metadata; available in Git history",
    }
    (output / "cost.json").write_text(json.dumps(cost, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: audit[key] for key in ("nodes", "edges", "communities", "code_files", "planning_nodes", "structurally_valid")}))


if __name__ == "__main__":
    main()
