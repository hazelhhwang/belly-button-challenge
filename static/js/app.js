var data; // Define a variable to hold the loaded data

// 1. Use D3 library to read samples.json
d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((jsonData) => {
    data = jsonData; // Store the loaded data in the global variable
    init(); // Initialise the page after data is loaded
}).catch(error => console.error("Error loading data:", error));

// 2. Create a horizontal bar chart with a dropdown menu
// Function to create the bar chart
function buildBarChart(sample) {
    // Filter data for the selected sample
    var selectedSample = data.samples.filter(s => s.id === sample)[0];

    // Slice top 10 OTUs
    var otuIds = selectedSample.otu_ids.slice(0, 10).map(String);
    var sampleValues = selectedSample.sample_values.slice(0, 10);
    var otuLabels = selectedSample.otu_labels.slice(0, 10);

    // Sort arrays in descending order of sample values
    var sortedIndices = sampleValues.map((_, i) => i).sort((a, b) => sampleValues[b] - sampleValues[a]);
    otuIds = sortedIndices.map(i => otuIds[i]);
    sampleValues = sortedIndices.map(i => sampleValues[i]);
    otuLabels = sortedIndices.map(i => otuLabels[i]);

    // Create trace for bar chart
    var trace = {
        x: sampleValues,
        y: otuIds.map(otuId => `OTU ${otuId}`),
        text: otuLabels,
        type: "bar",
        orientation: "h"
    };

    // Create layout
    var layout = {
        yaxis: {
            autorange: "reversed" // Reverse y-axis
        }
    };

    // Plot bar chart
    Plotly.newPlot("bar", [trace], layout);
}

// 3. Create a bubble chart
// Function to create the bubble chart
function buildBubbleChart(sample) {
    // Filter data for the selected sample
    var selectedSample = data.samples.filter(s => s.id === sample)[0];

    // Create trace for bubble chart
    var trace = {
        x: selectedSample.otu_ids,
        y: selectedSample.sample_values,
        text: selectedSample.otu_labels,
        mode: 'markers',
        marker: {
            size: selectedSample.sample_values,
            color: selectedSample.otu_ids
        }
    };

    // Create layout
    var layout = {
        xaxis: { title: 'OTU ID' },
    };

    // Plot bubble chart
    Plotly.newPlot('bubble', [trace], layout);
}

// 4. Display the sample metadata
// Function to display sample metadata
function showMetadata(sample) {
    var metadata = data.metadata.filter(m => m.id === parseInt(sample))[0];
    var metadataPanel = d3.select("#sample-metadata");
    metadataPanel.html("");
    Object.entries(metadata).forEach(([key, value]) => {
        metadataPanel.append("p").text(`${key}: ${value}`);
    });
}

// 5. Create the gauge chart
// Function to create the gauge chart
function buildGaugeChart(sample) {
    // Filter data for the selected sample
    var selectedSample = data.metadata.filter(m => m.id === parseInt(sample))[0];
    var washFrequency = selectedSample.wfreq;

    // Define the range of values for the gauge chart
    var gaugeData = [{
        domain: { x: [0, 1], y: [0, 1] },
        value: washFrequency,
        title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week", font: { size: 20 } }, // Bold and increase title font size
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: { range: [null, 9], tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], tickwidth: 1, tickcolor: "darkblue" }, // Specify tick values
            bar: { color: "darkblue" },
            bgcolor: "white",
            borderwidth: 2,
            bordercolor: "gray",
            steps: [
                { range: [0, 1], color: "rgb(255, 255, 255)" }, // White
                { range: [1, 2], color: "rgb(240, 255, 240)" }, // Lightest Green
                { range: [2, 3], color: "rgb(200, 255, 200)" }, // Light Green
                { range: [3, 4], color: "rgb(140, 255, 140)" }, // Medium Light Green
                { range: [4, 5], color: "rgb(50, 205, 50)" }, // Medium Green
                { range: [5, 6], color: "rgb(0, 128, 0)" }, // Dark Green
                { range: [6, 7], color: "rgb(0, 100, 0)" }, // Darker Green
                { range: [7, 8], color: "rgb(0, 70, 0)" }, // Darker Green
                { range: [8, 9], color: "rgb(0, 50, 0)" } // Darkest Green
            ]
        }
    }];

    // Define layout for the gauge chart
    var gaugeLayout = { width: 500, height: 400, margin: { t: 50, b: 0 } }; // Increase width and height of the chart and move it downwards by increasing top margin

    // Plot the gauge chart
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
}

// Function to initialise the page
function init() {
    // Check if data is loaded
    if (!data) {
        console.error("Data not loaded!");
        return;
    }

    // Populate dropdown menu with options
    var dropdownMenu = d3.select("#selDataset");

    // Read data to get sample names
    data.names.forEach((sample) => {
        dropdownMenu.append("option").text(sample).property("value", sample);
    });

    // Use the first sample to build initial plots
    var firstSample = data.names[0];
    buildBarChart(firstSample);
    buildBubbleChart(firstSample);
    buildGaugeChart(firstSample); // Add gauge chart initialization
    showMetadata(firstSample);
}

// Function to update all the plots when a new sample is selected
function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildBarChart(newSample);
    buildBubbleChart(newSample);
    buildGaugeChart(newSample); // Update the gauge chart
    showMetadata(newSample); // Update the demographic info
}
