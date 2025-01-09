// Load the data from a JSON file
d3.json("output.json").then(data => {

    const width = 928;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 40;

    const root = d3.hierarchy(data);
    const dx = 10;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    function update(source) {
        const duration = 250;
        const nodes = root.descendants();
        const links = root.links();

        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + marginTop + marginBottom;

        svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height]);

        const node = gNode.selectAll("g")
            .data(nodes, d => d.id || (d.id = ++i));

        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", d => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", 10)
            .attr("text-anchor", "start")
            .text(d => d.data.name)
            .attr("fill", "black")
            .append("title")
            .text(d => d.data.size ? `Taille: ${d.data.size} bytes` : "");

        node.merge(nodeEnter).transition()
            .duration(duration)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        node.exit().transition()
            .duration(duration)
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .remove();

        const link = gLink.selectAll("path")
            .data(links, d => d.target.id);

        link.enter().append("path")
            .attr("d", d => {
                const o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            })
            .merge(link)
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        link.exit().transition()
            .duration(duration)
            .attr("d", d => {
                const o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    let i = 0;
    root.x0 = dx / 2;
    root.y0 = 0;
    root.descendants().forEach(d => {
        d._children = d.children;
        d.children = null;
    });

    update(root);

    document.getElementById("tree2").appendChild(svg.node());
});
