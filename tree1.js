let tree1_width = 960;
let tree1_height = 600;

const tree1_layout = d3.tree().size([tree1_height, tree1_width - 160]);

d3.json("output.json").then(data => {
    
    const root = d3.hierarchy(data);

    tree1_layout(root);

    const treeW = root.descendants().reduce((acc, d) => Math.max(acc, d.y), 0) + 160;
    const treeH = root.descendants().reduce((acc, d) => Math.max(acc, d.x), 0);

    tree1_width = treeW;
    tree1_height= treeH;

    const container = d3.select("#tree1");

    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", tree1_width)
        .attr("height",tree1_height)
        .append("g")
        .attr("transform", "translate(40,0)");

    svg.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => `
            M${d.y},${d.x}
            C${d.parent.y + 100},${d.x}
             ${d.parent.y + 100},${d.parent.x}
             ${d.parent.y},${d.parent.x}`);

    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 10);

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);

}).catch(error => {

    console.error("Erreur lors du chargement du fichier JSON:", error);

});
