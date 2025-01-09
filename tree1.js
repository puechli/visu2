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
        .sort((a, b) => b.value - a.value)
        .eachBefore((node, i) => { node.id = i; }); // Ajoute un ID unique

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
        treemapLayout(source.copy());

        // Séparer les dossiers et les fichiers
        const folders = source.children.filter(d => d.children);
        const files = source.children.filter(d => !d.children);

        // Ajouter le rectangle ".." si le parent existe
        if (source.parent) {
            folders.unshift({ data: { name: ".." }, parent: source.parent });
        }

        // Dimensions des rectangles
        const rectWidth = 120;
        const rectHeight = 50;
        const columns = Math.ceil(Math.sqrt(folders.length));
        const gridWidth = columns * rectWidth;

        // Positionner les rectangles
        const folderSelection = svg.selectAll(".folder")
            .data(folders, d => d.data.name);

        folderSelection.exit().remove();

        const folderEnter = folderSelection.enter().append("g")
            .attr("class", "folder")
            .on("click", (event, d) => {
                if (d.data.name === "..") {
                    update(d.parent);
                } else if (d.children) {
                    update(d);
                }
            });

        folderEnter.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("x", (d, i) => (i % columns) * rectWidth)
            .attr("y", (d, i) => Math.floor(i / columns) * rectHeight)
            .attr("fill", "lightblue");

        folderEnter.append("text")
            .attr("x", (d, i) => (i % columns) * rectWidth + rectWidth / 2)
            .attr("y", (d, i) => Math.floor(i / columns) * rectHeight + rectHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d.data.name)
            .style("font-size", "12px");

        // Ajouter les cercles pour les fichiers
        const fileRadius = 20; // Rayon des cercles
        const fileColumns = Math.ceil(Math.sqrt(files.length));
        const fileGridWidth = fileColumns * (fileRadius * 2 + 10); // Espace entre les cercles

        const fileEnter = svg.selectAll(".file")
            .data(files, d => d.data.name)
            .enter().append("g")
            .attr("class", "file")
            .attr("transform", (d, i) => `translate(${(i % fileColumns) * (fileRadius * 2 + 10)},${Math.floor(i / fileColumns) * (fileRadius * 2 + 10) + (Math.ceil(folders.length / columns) * rectHeight)})`);

        fileEnter.append("circle")
            .attr("r", fileRadius)
            .attr("fill", "lightgreen");

        fileEnter.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d.data.name)
            .style("font-size", "10px");
    }

    // Initialiser la visualisation avec le root
    update(root);

}).catch(error => {
    console.error("Erreur lors du chargement du fichier JSON:", error);
});
