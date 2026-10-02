/**
 * canvasTools.js - OpenAI tool specifications for Groq AI Tutor.
 * All coordinates are defined in centimeters (cm) with origin (0,0), X right, Y up.
 */

export const CANVAS_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'add_point',
      description:
        'Draw a labeled point on the canvas at (x, y) in centimeters. Point labels default to A, B, C...',
      parameters: {
        type: 'object',
        properties: {
          x: { type: 'number', description: 'X coordinate in cm (positive is right, 0 is origin)' },
          y: { type: 'number', description: 'Y coordinate in cm (positive is up, 0 is origin)' },
          label: { type: 'string', description: 'Optional label like "A", "B", "C", "Origin"' },
          color: { type: 'string', description: 'Optional CSS hex color, default #ffffff' }
        },
        required: ['x', 'y']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_line',
      description:
        'Draw a straight segment between two points on the canvas. from and to can be either point labels (e.g. "A") or coordinate objects {x, y} in cm.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            description: 'Start point: either label string like "A" or coordinate object {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          to: {
            description: 'End point: either label string like "B" or coordinate object {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          color: { type: 'string', description: 'Optional line color hex' },
          width: { type: 'number', description: 'Optional line stroke width in px (default 2)' },
          dash: {
            type: 'array',
            items: { type: 'number' },
            description: 'Optional dash pattern e.g. [4, 4] for dashed line'
          }
        },
        required: ['from', 'to']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_circle',
      description: 'Draw a circle with a center point and radius in centimeters.',
      parameters: {
        type: 'object',
        properties: {
          center: {
            description: 'Center point: either label string like "O" or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          radius: { type: 'number', description: 'Radius in centimeters (must be > 0)' },
          color: { type: 'string', description: 'Optional stroke color' },
          width: { type: 'number', description: 'Optional stroke width' }
        },
        required: ['center', 'radius']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_triangle',
      description:
        'Draw a filled and stroked triangle given three vertices. Each vertex can be a label ("A") or coordinate {x, y} in cm.',
      parameters: {
        type: 'object',
        properties: {
          p1: {
            description: 'First vertex: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p2: {
            description: 'Second vertex: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p3: {
            description: 'Third vertex: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional vertex labels like ["A", "B", "C"]'
          },
          fillColor: { type: 'string', description: 'Optional CSS fill color rgba' },
          strokeColor: { type: 'string', description: 'Optional CSS stroke color' }
        },
        required: ['p1', 'p2', 'p3']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_rectangle',
      description: 'Draw a rectangle specified by corner coordinate (x, y), width and height in cm.',
      parameters: {
        type: 'object',
        properties: {
          x: { type: 'number', description: 'X coordinate in cm of bottom-left corner' },
          y: { type: 'number', description: 'Y coordinate in cm of bottom-left corner' },
          w: { type: 'number', description: 'Width in centimeters' },
          h: { type: 'number', description: 'Height in centimeters' },
          fillColor: { type: 'string', description: 'Optional fill color' },
          strokeColor: { type: 'string', description: 'Optional stroke color' }
        },
        required: ['x', 'y', 'w', 'h']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_polygon',
      description:
        'Draw an arbitrary N-gon polygon with 3 or more vertices. Side lengths and area badge are automatically displayed.',
      parameters: {
        type: 'object',
        properties: {
          points: {
            type: 'array',
            description: 'List of at least 3 vertices (either label strings or {x, y} coordinates in cm)',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: { x: { type: 'number' }, y: { type: 'number' } },
                  required: ['x', 'y']
                }
              ]
            }
          },
          fillColor: { type: 'string', description: 'Optional fill color' },
          strokeColor: { type: 'string', description: 'Optional stroke color' }
        },
        required: ['points']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_regular_polygon',
      description:
        'Draw a regular polygon (e.g. equilateral triangle, square, regular pentagon, hexagon, octagon) given center, radius and number of sides. Vertices are computed automatically in code.',
      parameters: {
        type: 'object',
        properties: {
          center: {
            description: 'Center of polygon: label string or {x, y} in cm (defaults to (0,0))',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          radius: { type: 'number', description: 'Circumradius in centimeters (> 0)' },
          sides: { type: 'integer', description: 'Number of sides (e.g. 5 for pentagon, 6 for hexagon, >= 3)' },
          fillColor: { type: 'string', description: 'Optional fill color' },
          strokeColor: { type: 'string', description: 'Optional stroke color' }
        },
        required: ['radius', 'sides']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_angle',
      description:
        'Draw an angle arc between two arms meeting at a common vertex, showing degree measurement.',
      parameters: {
        type: 'object',
        properties: {
          vertex: {
            description: 'Vertex point: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p1: {
            description: 'Point on first arm: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p2: {
            description: 'Point on second arm: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          color: { type: 'string', description: 'Optional arc color' }
        },
        required: ['vertex', 'p1', 'p2']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_right_angle',
      description:
        'Draw a square right-angle mark at a 90° vertex between two rays going towards p1 and p2.',
      parameters: {
        type: 'object',
        properties: {
          vertex: {
            description: 'Right-angle vertex: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p1: {
            description: 'First arm point: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          p2: {
            description: 'Second arm point: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          color: { type: 'string', description: 'Optional mark color' }
        },
        required: ['vertex', 'p1', 'p2']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_perpendicular',
      description:
        'Construct a perpendicular line and 90° right-angle indicator to a given line or between two points. Can pass through a specified point or midpoint.',
      parameters: {
        type: 'object',
        properties: {
          lineId: { type: 'string', description: 'Optional ID of existing line' },
          from: {
            description: 'Start of base line: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          to: {
            description: 'End of base line: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          throughPoint: {
            description: 'Optional point through which the perpendicular line must pass: label or {x, y}',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          lengthCm: { type: 'number', description: 'Total length of perpendicular line in cm (default 3 cm)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_ruler',
      description:
        'Place a measurement ruler between two points displaying exact distance in cm, angle and dimension arrows.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            description: 'Start point: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          to: {
            description: 'End point: label or {x, y} in cm',
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                properties: { x: { type: 'number' }, y: { type: 'number' } },
                required: ['x', 'y']
              }
            ]
          },
          color: { type: 'string', description: 'Optional ruler color' }
        },
        required: ['from', 'to']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_protractor',
      description: 'Place an interactive protractor tool on the canvas at (x, y) in cm.',
      parameters: {
        type: 'object',
        properties: {
          x: { type: 'number', description: 'X coordinate in cm (default 0)' },
          y: { type: 'number', description: 'Y coordinate in cm (default 0)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_object',
      description: 'Update properties (such as color, width, label, or position) of an existing canvas object by ID.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The unique ID of the object to update' },
          props: { type: 'object', description: 'Object properties to change' }
        },
        required: ['id', 'props']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_object',
      description:
        'Delete an object from the canvas by ID. Note: requires student confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the object to delete' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'clear_canvas',
      description:
        'Clear all objects from the canvas. Note: asks for student confirmation before executing.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_canvas_state',
      description:
        'Inspect the current state of the canvas: returns compact JSON list of all objects, labels, coordinates in cm, lengths, areas, and angles.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_view',
      description:
        'Adjust the canvas camera: "fit" automatically zooms to fit all objects, "zoom" sets a specific scale, "pan" moves the center, "reset" resets default zoom.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['fit', 'zoom', 'pan', 'reset'],
            description: 'View transformation type'
          },
          scale: { type: 'number', description: 'Target zoom scale (for type="zoom")' },
          offsetX: { type: 'number', description: 'Offset X in px (for type="pan")' },
          offsetY: { type: 'number', description: 'Offset Y in px (for type="pan")' }
        },
        required: ['type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_grid',
      description: 'Change grid settings (showGrid, showAxes, snapToGrid, showRulers, unit).',
      parameters: {
        type: 'object',
        properties: {
          showGrid: { type: 'boolean' },
          showAxes: { type: 'boolean' },
          snapToGrid: { type: 'boolean' },
          showRulers: { type: 'boolean' },
          gridStyle: { type: 'string', enum: ['subdivided', 'lines', 'dots', 'isometric'] },
          unit: { type: 'string', enum: ['cm', 'px', 'mm', 'in'] }
        }
      }
    }
  }
];
