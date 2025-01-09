let width = 960;
let height = 600;

// Créer le layout treemap
const treemapLayout = d3.treemap()
    .size([width, height])
    .padding(1);

d3.json("output.json").then(data => {
    // Convertir les données en hiérarchie
    const root = d3.hierarchy(data)
        .sum(d => d.size) // Utiliser la propriété "size" pour déterminer la taille des boîtes
        .sort((a, b) => b.value - a.value);

    // Appliquer le layout treemap
    treemapLayout(root);

    // Sélectionner le conteneur DIV et créer l'élément SVG
    const container = d3.select("#tree1");
    container.selectAll("svg").remove(); // Supprimer les SVG existants
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Ajouter les nœuds
    const node = svg.selectAll(".node")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    node.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue");

    node.append("text")
        .attr("dy", ".75em")
        .attr("x", 5)
        .attr("y", 20)
        .text(d => d.data.name);

}).catch(error => {
    console.error("Erreur lors du chargement du fichier JSON:", error);
});
