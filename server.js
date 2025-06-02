require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');




const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control']
}));
app.use(express.json());




// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER ,
  host: process.env.PGHOST ,
  password: process.env.PGPASSWORD ,
  database: process.env.POSTGRES_DB ,
  port: process.env.PGPORT
});
console.log('DEBUG DB_USER:', process.env.POSTGRES_USER);
console.log('DEBUG DB_HOST:', process.env.PGHOST);
console.log('DEBUG DB_PASSWORD:', process.env.PGPASSWORD);
console.log('DEBUG DB_NAME:', process.env.POSTGRES_DB);
console.log('DEBUG DB_PORT:', process.env.PGPORT);
// Verificar conexión a la base de datos

// Información del servidor MCP
const MCP_SERVER_INFO = {
  name: "postgresql-server",
  version: "1.0.0",
  description: "Servidor MCP para operaciones con PostgreSQL - Gestión de estudiantes, asignaturas y notas",
  protocolVersion: "2024-11-05"
};

// Definición de herramientas MCP
const MCP_TOOLS = [
  {
    name: "get_all_students",
    description: "Obtiene todos los estudiantes registrados en la base de datos",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "get_student_by_id",
    description: "Obtiene información de un estudiante específico por su ID",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante"
        }
      },
      required: ["id_estudiante"],
      additionalProperties: false
    }
  },
  {
    name: "create_student",
    description: "Crea un nuevo estudiante en la base de datos",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante"
        },
        nombre_completo: {
          type: "string",
          description: "Nombre completo del estudiante"
        },
        carrera: {
          type: "string",
          description: "Carrera que estudia"
        },
        nivel_academico: {
          type: "string",
          description: "Nivel académico (pregrado, posgrado, etc.)"
        },
        promedio_general: {
          type: "number",
          description: "Promedio general del estudiante"
        }
      },
      required: ["id_estudiante", "nombre_completo"],
      additionalProperties: false
    }
  },
  {
    name: "update_student",
    description: "Actualiza información de un estudiante existente",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante a actualizar"
        },
        nombre_completo: {
          type: "string",
          description: "Nombre completo del estudiante"
        },
        carrera: {
          type: "string",
          description: "Carrera que estudia"
        },
        nivel_academico: {
          type: "string",
          description: "Nivel académico"
        },
        promedio_general: {
          type: "number",
          description: "Promedio general del estudiante"
        }
      },
      required: ["id_estudiante"],
      additionalProperties: false
    }
  },
  {
    name: "get_students_by_career",
    description: "Obtiene estudiantes filtrados por carrera",
    inputSchema: {
      type: "object",
      properties: {
        carrera: {
          type: "string",
          description: "Nombre de la carrera"
        }
      },
      required: ["carrera"],
      additionalProperties: false
    }
  },
  {
    name: "get_all_subjects",
    description: "Obtiene todas las asignaturas disponibles",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "create_subject",
    description: "Crea una nueva asignatura",
    inputSchema: {
      type: "object",
      properties: {
        nombre_asignatura: {
          type: "string",
          description: "Nombre de la asignatura"
        }
      },
      required: ["nombre_asignatura"],
      additionalProperties: false
    }
  },
  {
    name: "get_student_grades",
    description: "Obtiene todas las notas de un estudiante específico",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante"
        }
      },
      required: ["id_estudiante"],
      additionalProperties: false
    }
  },
  {
    name: "create_grade",
    description: "Registra una nueva nota para un estudiante",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante"
        },
        id_asignatura: {
          type: "integer",
          description: "ID de la asignatura"
        },
        tipo_evaluacion: {
          type: "string",
          description: "Tipo de evaluación (parcial, final, quiz, etc.)"
        },
        nota: {
          type: "number",
          description: "Nota obtenida (0.0 - 5.0)"
        }
      },
      required: ["id_estudiante", "id_asignatura", "tipo_evaluacion", "nota"],
      additionalProperties: false
    }
  },
  {
    name: "get_student_averages",
    description: "Calcula el promedio de un estudiante por asignatura",
    inputSchema: {
      type: "object",
      properties: {
        id_estudiante: {
          type: "string",
          description: "ID único del estudiante"
        }
      },
      required: ["id_estudiante"],
      additionalProperties: false
    }
  }
];

// Definición de prompts MCP
const MCP_PROMPTS = [
  {
    name: "student_report",
    description: "Genera un reporte completo de un estudiante con sus notas y promedios",
    arguments: [
      {
        name: "id_estudiante",
        description: "ID único del estudiante para el reporte",
        required: true
      }
    ]
  },
  {
    name: "career_analysis",
    description: "Analiza el rendimiento académico de todos los estudiantes de una carrera",
    arguments: [
      {
        name: "carrera",
        description: "Nombre de la carrera a analizar",
        required: true
      }
    ]
  },
  {
    name: "academic_summary",
    description: "Genera un resumen académico general del sistema",
    arguments: []
  },
  {
    name: "student_comparison",
    description: "Compara el rendimiento entre dos estudiantes",
    arguments: [
      {
        name: "id_estudiante1",
        description: "ID del primer estudiante",
        required: true
      },
      {
        name: "id_estudiante2",
        description: "ID del segundo estudiante",
        required: true
      }
    ]
  },
  {
    name: "grade_analysis",
    description: "Analiza las notas de una asignatura específica",
    arguments: [
      {
        name: "id_asignatura",
        description: "ID de la asignatura a analizar",
        required: true
      }
    ]
  }
];

// Funciones de base de datos
async function executeStudentQueries(toolName, args) {
  try {
    switch (toolName) {
      case 'get_all_students':
        const allStudents = await pool.query('SELECT * FROM estudiantes ORDER BY nombre_completo');
        return {
          success: true,
          data: allStudents.rows,
          count: allStudents.rows.length
        };

      case 'get_student_by_id':
        const student = await pool.query('SELECT * FROM estudiantes WHERE id_estudiante = $1', [args.id_estudiante]);
        if (student.rows.length === 0) {
          return { success: false, error: 'Estudiante no encontrado' };
        }
        return { success: true, data: student.rows[0] };

      case 'create_student':
        const newStudent = await pool.query(
          'INSERT INTO estudiantes (id_estudiante, nombre_completo, carrera, nivel_academico, promedio_general) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [args.id_estudiante, args.nombre_completo, args.carrera || null, args.nivel_academico || null, args.promedio_general || null]
        );
        return { success: true, data: newStudent.rows[0], message: 'Estudiante creado exitosamente' };

      case 'update_student':
        const updatedStudent = await pool.query(
          'UPDATE estudiantes SET nombre_completo = COALESCE($2, nombre_completo), carrera = COALESCE($3, carrera), nivel_academico = COALESCE($4, nivel_academico), promedio_general = COALESCE($5, promedio_general) WHERE id_estudiante = $1 RETURNING *',
          [args.id_estudiante, args.nombre_completo, args.carrera, args.nivel_academico, args.promedio_general]
        );
        if (updatedStudent.rows.length === 0) {
          return { success: false, error: 'Estudiante no encontrado' };
        }
        return { success: true, data: updatedStudent.rows[0], message: 'Estudiante actualizado exitosamente' };

      case 'get_students_by_career':
        const studentsByCareer = await pool.query('SELECT * FROM estudiantes WHERE carrera = $1 ORDER BY nombre_completo', [args.carrera]);
        return { success: true, data: studentsByCareer.rows, count: studentsByCareer.rows.length };

      case 'get_all_subjects':
        const allSubjects = await pool.query('SELECT * FROM asignaturas ORDER BY nombre_asignatura');
        return { success: true, data: allSubjects.rows, count: allSubjects.rows.length };

      case 'create_subject':
        const newSubject = await pool.query('INSERT INTO asignaturas (nombre_asignatura) VALUES ($1) RETURNING *', [args.nombre_asignatura]);
        return { success: true, data: newSubject.rows[0], message: 'Asignatura creada exitosamente' };

      case 'get_student_grades':
        const grades = await pool.query(`
          SELECT n.*, a.nombre_asignatura 
          FROM notas n 
          JOIN asignaturas a ON n.id_asignatura = a.id_asignatura 
          WHERE n.id_estudiante = $1 
          ORDER BY a.nombre_asignatura, n.tipo_evaluacion
        `, [args.id_estudiante]);
        return { success: true, data: grades.rows, count: grades.rows.length };

      case 'create_grade':
        const newGrade = await pool.query(
          'INSERT INTO notas (id_estudiante, id_asignatura, tipo_evaluacion, nota) VALUES ($1, $2, $3, $4) RETURNING *',
          [args.id_estudiante, args.id_asignatura, args.tipo_evaluacion, args.nota]
        );
        return { success: true, data: newGrade.rows[0], message: 'Nota registrada exitosamente' };

      case 'get_student_averages':
        const averages = await pool.query(`
          SELECT 
            a.nombre_asignatura,
            AVG(n.nota) as promedio,
            COUNT(n.nota) as total_notas
          FROM notas n 
          JOIN asignaturas a ON n.id_asignatura = a.id_asignatura 
          WHERE n.id_estudiante = $1 
          GROUP BY a.id_asignatura, a.nombre_asignatura
          ORDER BY a.nombre_asignatura
        `, [args.id_estudiante]);
        return { success: true, data: averages.rows, count: averages.rows.length };

      default:
        return { success: false, error: 'Herramienta no encontrada' };
    }
  } catch (error) {
    console.error('Error en operación de base de datos:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Ya existe un registro con esos datos únicos' };
    } else if (error.code === '23503') {
      return { success: false, error: 'Referencia no válida - estudiante o asignatura no existe' };
    }
    return { success: false, error: error.message };
  }
}

// Función para generar contenido de prompts
async function generatePromptContent(promptName, args) {
  try {
    switch (promptName) {
      case 'student_report':
        const studentData = await pool.query('SELECT * FROM estudiantes WHERE id_estudiante = $1', [args.id_estudiante]);
        if (studentData.rows.length === 0) {
          return { success: false, error: 'Estudiante no encontrado' };
        }
        
        const grades = await pool.query(`
          SELECT n.*, a.nombre_asignatura 
          FROM notas n 
          JOIN asignaturas a ON n.id_asignatura = a.id_asignatura 
          WHERE n.id_estudiante = $1 
          ORDER BY a.nombre_asignatura, n.tipo_evaluacion
        `, [args.id_estudiante]);

        const averages = await pool.query(`
          SELECT 
            a.nombre_asignatura,
            AVG(n.nota) as promedio,
            COUNT(n.nota) as total_notas
          FROM notas n 
          JOIN asignaturas a ON n.id_asignatura = a.id_asignatura 
          WHERE n.id_estudiante = $1 
          GROUP BY a.id_asignatura, a.nombre_asignatura
          ORDER BY a.nombre_asignatura
        `, [args.id_estudiante]);

        const student = studentData.rows[0];
        let report = `# REPORTE ACADÉMICO - ${student.nombre_completo}\n\n`;
        report += `**ID Estudiante:** ${student.id_estudiante}\n`;
        report += `**Carrera:** ${student.carrera || 'No especificada'}\n`;
        report += `**Nivel Académico:** ${student.nivel_academico || 'No especificado'}\n`;
        report += `**Promedio General:** ${student.promedio_general || 'No calculado'}\n\n`;
        
        if (averages.rows.length > 0) {
          report += `## PROMEDIOS POR ASIGNATURA\n\n`;
          averages.rows.forEach(avg => {
            report += `- **${avg.nombre_asignatura}:** ${parseFloat(avg.promedio).toFixed(2)} (${avg.total_notas} evaluaciones)\n`;
          });
          report += `\n`;
        }

        if (grades.rows.length > 0) {
          report += `## DETALLE DE NOTAS\n\n`;
          let currentSubject = '';
          grades.rows.forEach(grade => {
            if (grade.nombre_asignatura !== currentSubject) {
              currentSubject = grade.nombre_asignatura;
              report += `### ${currentSubject}\n`;
            }
            report += `- ${grade.tipo_evaluacion}: ${grade.nota}\n`;
          });
        }

        return { success: true, content: report };

      case 'career_analysis':
        const careerStudents = await pool.query('SELECT * FROM estudiantes WHERE carrera = $1', [args.carrera]);
        if (careerStudents.rows.length === 0) {
          return { success: false, error: 'No se encontraron estudiantes en esta carrera' };
        }

        let analysis = `# ANÁLISIS DE CARRERA: ${args.carrera}\n\n`;
        analysis += `**Total de estudiantes:** ${careerStudents.rows.length}\n\n`;
        analysis += `## LISTADO DE ESTUDIANTES\n\n`;
        
        careerStudents.rows.forEach(student => {
          analysis += `- **${student.nombre_completo}** (ID: ${student.id_estudiante})`;
          if (student.promedio_general) {
            analysis += ` - Promedio: ${student.promedio_general}`;
          }
          analysis += `\n`;
        });

        return { success: true, content: analysis };

      case 'academic_summary':
        const totalStudents = await pool.query('SELECT COUNT(*) as total FROM estudiantes');
        const totalSubjects = await pool.query('SELECT COUNT(*) as total FROM asignaturas');
        const totalGrades = await pool.query('SELECT COUNT(*) as total FROM notas');
        const careers = await pool.query('SELECT carrera, COUNT(*) as estudiantes FROM estudiantes WHERE carrera IS NOT NULL GROUP BY carrera ORDER BY estudiantes DESC');

        let summary = `# RESUMEN ACADÉMICO GENERAL\n\n`;
        summary += `**Total de estudiantes:** ${totalStudents.rows[0].total}\n`;
        summary += `**Total de asignaturas:** ${totalSubjects.rows[0].total}\n`;
        summary += `**Total de notas registradas:** ${totalGrades.rows[0].total}\n\n`;
        
        if (careers.rows.length > 0) {
          summary += `## DISTRIBUCIÓN POR CARRERAS\n\n`;
          careers.rows.forEach(career => {
            summary += `- **${career.carrera}:** ${career.estudiantes} estudiantes\n`;
          });
        }

        return { success: true, content: summary };

      case 'student_comparison':
        const student1 = await pool.query('SELECT * FROM estudiantes WHERE id_estudiante = $1', [args.id_estudiante1]);
        const student2 = await pool.query('SELECT * FROM estudiantes WHERE id_estudiante = $1', [args.id_estudiante2]);
        
        if (student1.rows.length === 0 || student2.rows.length === 0) {
          return { success: false, error: 'Uno o ambos estudiantes no fueron encontrados' };
        }

        let comparison = `# COMPARACIÓN DE ESTUDIANTES\n\n`;
        comparison += `## Estudiante 1: ${student1.rows[0].nombre_completo}\n`;
        comparison += `- **ID:** ${student1.rows[0].id_estudiante}\n`;
        comparison += `- **Carrera:** ${student1.rows[0].carrera || 'No especificada'}\n`;
        comparison += `- **Promedio:** ${student1.rows[0].promedio_general || 'No calculado'}\n\n`;
        
        comparison += `## Estudiante 2: ${student2.rows[0].nombre_completo}\n`;
        comparison += `- **ID:** ${student2.rows[0].id_estudiante}\n`;
        comparison += `- **Carrera:** ${student2.rows[0].carrera || 'No especificada'}\n`;
        comparison += `- **Promedio:** ${student2.rows[0].promedio_general || 'No calculado'}\n\n`;

        return { success: true, content: comparison };

      case 'grade_analysis':
        const subjectInfo = await pool.query('SELECT * FROM asignaturas WHERE id_asignatura = $1', [args.id_asignatura]);
        if (subjectInfo.rows.length === 0) {
          return { success: false, error: 'Asignatura no encontrada' };
        }

        const subjectGrades = await pool.query(`
          SELECT n.*, e.nombre_completo 
          FROM notas n 
          JOIN estudiantes e ON n.id_estudiante = e.id_estudiante 
          WHERE n.id_asignatura = $1 
          ORDER BY n.nota DESC
        `, [args.id_asignatura]);

        const gradeStats = await pool.query(`
          SELECT 
            AVG(nota) as promedio,
            MIN(nota) as minima,
            MAX(nota) as maxima,
            COUNT(*) as total_notas
          FROM notas 
          WHERE id_asignatura = $1
        `, [args.id_asignatura]);

        let gradeAnalysis = `# ANÁLISIS DE ASIGNATURA: ${subjectInfo.rows[0].nombre_asignatura}\n\n`;
        
        if (gradeStats.rows[0].total_notas > 0) {
          const stats = gradeStats.rows[0];
          gradeAnalysis += `## ESTADÍSTICAS\n\n`;
          gradeAnalysis += `- **Promedio general:** ${parseFloat(stats.promedio).toFixed(2)}\n`;
          gradeAnalysis += `- **Nota más alta:** ${stats.maxima}\n`;
          gradeAnalysis += `- **Nota más baja:** ${stats.minima}\n`;
          gradeAnalysis += `- **Total de evaluaciones:** ${stats.total_notas}\n\n`;
          
          gradeAnalysis += `## NOTAS POR ESTUDIANTE\n\n`;
          subjectGrades.rows.forEach(grade => {
            gradeAnalysis += `- **${grade.nombre_completo}:** ${grade.nota} (${grade.tipo_evaluacion})\n`;
          });
        } else {
          gradeAnalysis += `No hay notas registradas para esta asignatura.\n`;
        }

        return { success: true, content: gradeAnalysis };

      default:
        return { success: false, error: 'Prompt no encontrado' };
    }
  } catch (error) {
    console.error('Error generando contenido del prompt:', error);
    return { success: false, error: error.message };
  }
}

// Endpoint principal MCP HTTP Stream
app.post('/mcp', async (req, res) => {
  try {
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { method, params } = req.body;

    let response;

    switch (method) {
      case 'initialize':
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              resources: {},
              prompts: {}
            },
            serverInfo: MCP_SERVER_INFO
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            tools: MCP_TOOLS
          }
        };
        break;

      case 'tools/call':
        const toolName = params.name;
        const toolArgs = params.arguments || {};
        
        // Validar que la herramienta existe
        const tool = MCP_TOOLS.find(t => t.name === toolName);
        if (!tool) {
          response = {
            jsonrpc: "2.0",
            id: req.body.id,
            error: {
              code: -32601,
              message: `Herramienta '${toolName}' no encontrada`
            }
          };
          break;
        }

        // Ejecutar la operación de base de datos
        const result = await executeStudentQueries(toolName, toolArgs);
        
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };
        break;

      case 'resources/list':
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            resources: []
          }
        };
        break;

      case 'prompts/list':
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            prompts: MCP_PROMPTS
          }
        };
        break;

      case 'prompts/get':
        const promptName = params.name;
        const promptArgs = params.arguments || {};
        
        // Validar que el prompt existe
        const prompt = MCP_PROMPTS.find(p => p.name === promptName);
        if (!prompt) {
          response = {
            jsonrpc: "2.0",
            id: req.body.id,
            error: {
              code: -32601,
              message: `Prompt '${promptName}' no encontrado`
            }
          };
          break;
        }

        // Generar contenido del prompt
        const promptResult = await generatePromptContent(promptName, promptArgs);
        
        if (promptResult.success) {
          response = {
            jsonrpc: "2.0",
            id: req.body.id,
            result: {
              description: prompt.description,
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: promptResult.content
                  }
                }
              ]
            }
          };
        } else {
          response = {
            jsonrpc: "2.0",
            id: req.body.id,
            error: {
              code: -32603,
              message: promptResult.error
            }
          };
        }
        break;

      default:
        response = {
          jsonrpc: "2.0",
          id: req.body.id,
          error: {
            code: -32601,
            message: `Método '${method}' no implementado`
          }
        };
    }

    // Enviar respuesta como stream
    res.write(JSON.stringify(response));
    res.end();

  } catch (error) {
    console.error('Error en MCP endpoint:', error);
    const errorResponse = {
      jsonrpc: "2.0",
      id: req.body.id || null,
      error: {
        code: -32603,
        message: "Error interno del servidor",
        data: error.message
      }
    };
    res.write(JSON.stringify(errorResponse));
    res.end();
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor MCP HTTP Stream funcionando correctamente',
    serverInfo: MCP_SERVER_INFO,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para listar herramientas disponibles (para debugging)
app.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: MCP_TOOLS,
    count: MCP_TOOLS.length
  });
});

// Endpoint para listar prompts disponibles (para debugging)
app.get('/prompts', (req, res) => {
  res.json({
    success: true,
    prompts: MCP_PROMPTS,
    count: MCP_PROMPTS.length
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'POST /mcp - Endpoint principal MCP',
      'GET /health - Estado del servidor',
      'GET /tools - Lista de herramientas disponibles',
      'GET /prompts - Lista de prompts disponibles'
    ]
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Middleware para validar conexión a la base de datos al iniciar
const validateDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    console.log('Verifica las credenciales en el archivo .env');
  }
};

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor MCP HTTP Stream ejecutándose en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Herramientas MCP: http://localhost:${PORT}/tools`);
  console.log(`📝 Prompts MCP: http://localhost:${PORT}/prompts`);
  console.log(`🔗 Endpoint MCP: http://localhost:${PORT}/mcp`);
  console.log(`📚 Protocolo MCP: ${MCP_SERVER_INFO.protocolVersion}`);
  
  // Validar conexión a la base de datos
  await validateDatabaseConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor MCP...');
  await pool.end();
  process.exit(0);
});