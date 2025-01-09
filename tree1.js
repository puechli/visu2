let width = 960;
let height = 600;

// Créer le layout treemap
const treemapLayout = d3.treemap()
    .size([width, height])
    .padding(1);

// Échelle de couleurs entre le violet et le rouge
const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["violet", "red"]);

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

    // Fonction pour mettre à jour la visualisation
    function update(source) {
        // Appliquer le layout treemap au nœud source
        treemapLayout(source);

        const nodes = source.children ? source.children : [source];
        const transition = svg.transition().duration(750);

        // Ajouter les nœuds
        const node = svg.selectAll(".node")
            .data(nodes, d => d.id);

        node.exit().remove();

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${source.x0},${source.y0})`);

        nodeEnter.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.depth / root.height));

        nodeEnter.append("text")
            .attr("dy", ".75em")
            .attr("x", 5)
            .attr("y", 20)
            .text(d => d.data.name);

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition(transition)
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        nodeUpdate.select("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Ajouter l'événement de clic aux nœuds existants et nouveaux
        nodeUpdate.on("click", d => {
            if (d.children) {
                update(d);
            }
        });
    }

    // Initialiser la visualisation avec le root
    update(root);

}).catch(error => {
    console.error("Erreur lors du chargement du fichier JSON:", error);
});
