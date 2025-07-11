/// <reference path="JsDiagram-vsdoc.js" />

var DiagramView = MindFusion.Diagramming.DiagramView;
var Diagram = MindFusion.Diagramming.Diagram;
var GlassEffect = MindFusion.Diagramming.GlassEffect;
var Style = MindFusion.Diagramming.Style;
var PathFinder = MindFusion.Diagramming.PathFinder;

var Rect = MindFusion.Drawing.Rect;

var shapeNodeStyle = new Style();
var diagram = null;

document.addEventListener("DOMContentLoaded", function () {

	// create a DiagramView component that wraps the "diagram" canvas
	var diagramView = DiagramView.create(document.getElementById("diagram"));
	diagramView.linkBackId = "mindfusionLink";
	diagram = diagramView.diagram;

	// styling
	shapeNodeStyle.brush = { type: 'SolidBrush', color: '#e0e9e9' };
	shapeNodeStyle.stroke = "#7F7F7F";
	shapeNodeStyle.fontName = "Verdana";
	shapeNodeStyle.fontSize = 4;
	shapeNodeStyle.nodeEffects = [new GlassEffect()];
	diagram.style = shapeNodeStyle;

	// set the size of diagram's scrollable area (unit is millimeter by default)
	diagram.bounds = new Rect(0, 0, 1000, 1000);

	// you can create diagram items from code;
	// alternative syntax is diagram.addItem(new ShapeNode());
	var node1 = diagram.factory.createShapeNode(10, 10, 30, 30);
	node1.text = "Hello";

	var node2 = diagram.factory.createShapeNode(60, 25, 30, 30);
	node2.text = "World";

	diagram.factory.createDiagramLink(node1, node2);

	// the Palette component lets users create shapes using drag-and-drop;
	// users can also draw on the canvas using mouse or other pointing devices, as
	// specified via DiagramView.behavior property;
	var palette = MindFusion.Diagramming.Controls.Palette.create(document.getElementById("palette"));
	palette.padding = 2;
	palette.captionFont = new MindFusion.Drawing.Font("sans-serif", 3);
	palette.setTop("200px");
	palette.setWidth("200px");
	palette.setHeight("");
	palette.theme = "business";
	initPalette(palette);

	// create an Overview component that displays scaled-down version of the diagram
	var overview = MindFusion.Diagramming.Overview.create(document.getElementById("overview"));
	overview.diagramView = diagramView;
	overview.backColor = "#eee";

	// create a ZoomControl to allow changing zoom level using slider UI
	var zoomer = MindFusion.Controls.ZoomControl.create(document.getElementById("zoomer"));
	zoomer.target = diagramView;
	zoomer.borderColor = "#5a79a5";

	// create a Ruler component that shows measurement scales and allows aligning nodes
	var ruler = MindFusion.Diagramming.Ruler.create(document.getElementById("ruler"));
	ruler.diagramView = diagramView;
	ruler.backColor = "#fff";
	ruler.foreColor = "#5a79a5";
	ruler.textColor = "#5a79a5";

	// buttons to save and load diagrams
	document.getElementById("newButton").addEventListener("click", onNewClick);
	document.getElementById("saveButton").addEventListener("click", onSaveClick);
	document.getElementById("loadButton").addEventListener("click", onLoadClick);

	// detect user's actions by handling diagram events, such as nodeCreated
	diagram.nodeCreated.addEventListener(
		(sender, args) =>
		{
			console.log("user has created a node");
			args.node.brush = "lightblue";
		});

	// validation events let us prevent users' actions; for example,
	// onLinkCreating handler below prevents users from drawing a cycle
	diagram.linkCreating.addEventListener(onLinkCreating);
});

function onLinkCreating(diagram, args)
{
    if (args.destination == null)
    {
        // not pointing to a node yet
        return;
    }

    var pathFinder = new PathFinder(diagram);
    var path = pathFinder.findShortestPath(
        args.destination, args.origin);

    if (path != null)
    {
        // adding this new link would create a cycle
        // [origin]--[dest]--[path internal nodes]--[origin]

        args.cancel = true;
    }
}

function initPalette(palette)
{
	// stock shape geometries are listed here:
	// https://www.mindfusion.eu/onlinehelp/jsdiagram/CC_refTable_of_Predefined_Shapes_4.htm

	// use the shape designer tool to draw custom shape geometries:
	// https://mindfusion.eu/tools/shape-designer.html

	// apart from ShapeNode, you could also add TableNode or ContainerNode objects

	palette.addCategory("Flowchart Shapes");
	var shapes = ["Start", "Input", "Process", "Decision"]
	for (var i = 0; i < shapes.length; ++i) {
		var node = new MindFusion.Diagramming.ShapeNode();
		node.shape = shapes[i];
		node.style = shapeNodeStyle;
		palette.addItem(node, "Flowchart Shapes", shapes[i]);
	}

	palette.addCategory("Data Shapes");
	var shapes = ["Database", "Input", "Delay", "Document", "ManualOperation"];
	for (var i = 0; i < shapes.length; ++i) {
		var node = new MindFusion.Diagramming.ShapeNode();
		node.shape = shapes[i];
		node.style = shapeNodeStyle;
		palette.addItem(node, "Data Shapes", shapes[i]);
	}

	palette.addCategory("BPMN Shapes");
	var shapes = ["BpmnStartLink", "BpmnIntermediateLink", "BpmnEndLink",
		"BpmnStartMessage", "BpmnIntermediateMessage", "BpmnEndMessage"];
	for (var i = 0; i < shapes.length; ++i) {
		var node = new MindFusion.Diagramming.ShapeNode();
		node.shape = shapes[i];
		node.style = shapeNodeStyle;
		palette.addItem(node, "BPMN Shapes", shapes[i]);
	}

	// expand the first accordion item (Flowchart Shapes category)
	palette.collapseItems(palette.items.item(2));
	palette.expandItems(palette.items.item(0));
}

function onNewClick()
{
	diagram.clearAll();
}

const insecureContextMessage = 'The File System API is not available in this context. Please run the page from a web server (npm start).';

async function onSaveClick()
{
	try
	{
		// in this example we store diagram JSON files on local file system;
		// alternatively you could send JSON to server-side using fetch API, e.g.
		// fetch('api_url', { method: 'POST', ... }
		const json = diagram.toJson();

		// file system API is not fully supported in some browsers yet
		if (window.showSaveFilePicker)
		{
			if (!window.isSecureContext)
			{
				alert(insecureContextMessage);
				return;
			}
		
			const handle = await window.showSaveFilePicker(
			{
				startIn: 'documents',
					suggestedName: 'diagram.json',
					types: [{
						description: 'JSON Files',
						accept: {
							'application/json': ['.json'],
						},
					}],
			});
			const writable = await handle.createWritable();
			await writable.write(json);
			await writable.close();
		}
		else
		{
			// work-around for browsers that do not support file system
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'diagram.json';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	}
	catch (err)
	{
		console.error(err.name, err.message);
	}
}

async function onLoadClick()
{
	try
	{
		// in this example we store diagram JSON files on local file system;
		// alternatively you could load JSON from server-side using fetch API, e.g.
		// fetch('api_url', { method: 'GET', ... }

		// file system API is not fully supported in some browsers yet
		if (window.showOpenFilePicker)
		{
			if (!window.isSecureContext)
			{
				alert(insecureContextMessage);
				return;
			}
		
			const [handle] = await window.showOpenFilePicker(
			{
				startIn: 'documents',
					types: [{
						description: 'JSON Files',
						accept: {
							'application/json': ['.json'],
						},
					}],
			});
			const file = await handle.getFile();
			const content = await file.text();
			diagram.fromJson(content);
		}
		else
		{
			// work-around for browsers that do not support file system
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json,application/json';
			input.onchange = async (e) => {
				const file = e.target.files[0];
				const content = await file.text();
				diagram.fromJson(content);
			};
			input.click();
		}
	}
	catch (err)
	{
		console.error(err.name, err.message);
	}
}
