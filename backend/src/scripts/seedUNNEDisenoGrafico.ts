import { AppDataSource } from "../config/DataSource";
import { Universidad } from "../models/universidad.model";
import { Carrera } from "../models/carrera.model";
import { Materia } from "../models/materias.model";
import { CorrelativaDetalle, TipoCorrelativa } from "../models/correlativas.model";
import { Duración } from "../types/materias";

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected");

        const univRepo = AppDataSource.getRepository(Universidad);
        const carrRepo = AppDataSource.getRepository(Carrera);
        const matRepo = AppDataSource.getRepository(Materia);
        const corrRepo = AppDataSource.getRepository(CorrelativaDetalle);

        // 1. Asegurar UNNE
        let unne = await univRepo.findOneBy({ nombre: "Universidad Nacional del Nordeste" });
        if (!unne) {
            unne = univRepo.create({ nombre: "Universidad Nacional del Nordeste", abreviatura: "UNNE" });
            await univRepo.save(unne);
        }

        // 2. Asegurar Carrera
        let dg = await carrRepo.findOneBy({ nombre: "Diseño Gráfico", universidadId: unne.id });
        if (!dg) {
            dg = carrRepo.create({ nombre: "Diseño Gráfico", universidadId: unne.id });
            await carrRepo.save(dg);
        }

        const dgId = dg.id;
        console.log(`📍 Carrer: Diseño Gráfico (UNNE) - ID: ${dgId}`);

        // 3. Definir Materias
        const MATERIAS_DG = [
            // NIVEL 1
            { numero: 1, nombre: "Curso de ingreso", nivel: "I", duracion: Duración.Cuatrimestral1 },
            { numero: 2, nombre: "Sistemas de Representación", nivel: "I", duracion: Duración.Anual },
            { numero: 3, nombre: "Morfología I", nivel: "I", duracion: Duración.Anual },
            { numero: 4, nombre: "Tipografía I", nivel: "I", duracion: Duración.Anual },
            { numero: 5, nombre: "Taller de Diseño Gráfico I", nivel: "I", duracion: Duración.Anual },
            { numero: 6, nombre: "Medios de Expresión I", nivel: "I", duracion: Duración.Anual },
            { numero: 7, nombre: "Comunicación I", nivel: "I", duracion: Duración.Anual },
            { numero: 8, nombre: "Introducción al Diseño", nivel: "I", duracion: Duración.Anual },
            // NIVEL 2
            { numero: 9, nombre: "Morfología II", nivel: "II", duracion: Duración.Anual },
            { numero: 10, nombre: "Tipografía II", nivel: "II", duracion: Duración.Anual },
            { numero: 11, nombre: "Taller de Diseño Gráfico II", nivel: "II", duracion: Duración.Anual },
            { numero: 12, nombre: "Medios de Expresión II", nivel: "II", duracion: Duración.Anual },
            { numero: 13, nombre: "Tecnología I", nivel: "II", duracion: Duración.Anual },
            { numero: 14, nombre: "Historia del Diseño Gráfico I", nivel: "II", duracion: Duración.Anual },
            { numero: 15, nombre: "Comunicación II", nivel: "II", duracion: Duración.Anual },
            // NIVEL 3
            { numero: 16, nombre: "Taller de Diseño Gráfico III", nivel: "III", duracion: Duración.Anual },
            { numero: 17, nombre: "Tecnología II", nivel: "III", duracion: Duración.Anual },
            { numero: 18, nombre: "Marketing y Gestión", nivel: "III", duracion: Duración.Anual },
            { numero: 19, nombre: "Historia del Diseño Gráfico II", nivel: "III", duracion: Duración.Anual },
            { numero: 20, nombre: "Sociología de la Comunicación", nivel: "III", duracion: Duración.Anual },
            { numero: 21, nombre: "Introducción al Diseño Web [O1A]", nivel: "III", duracion: Duración.Cuatrimestral1 },
            { numero: 22, nombre: "Historia del Arte [O1B]", nivel: "III", duracion: Duración.Cuatrimestral1 },
            { numero: 23, nombre: "Introducción a la gestión [O1B]", nivel: "III", duracion: Duración.Cuatrimestral1 },
            { numero: 24, nombre: "Tecnologías aplicadas al arte [O1B]", nivel: "III", duracion: Duración.Cuatrimestral1 },
            // NIVEL 4
            { numero: 25, nombre: "Proyecto Final de Carrera", nivel: "IV", duracion: Duración.Anual },
            { numero: 26, nombre: "Práctica Profesional Asistida", nivel: "IV", duracion: Duración.Anual },
            { numero: 27, nombre: "Gestión de Proyectos", nivel: "IV", duracion: Duración.Anual },
            { numero: 28, nombre: "Competencias Discursivas", nivel: "IV", duracion: Duración.Anual },
            { numero: 29, nombre: "Metodología de la Ciencia", nivel: "IV", duracion: Duración.Anual },
            { numero: 30, nombre: "Organización y Ejercicio Prof.", nivel: "IV", duracion: Duración.Anual },
            { numero: 31, nombre: "Fotografía [O2A]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 32, nombre: "Sociología de la imagen [O2B]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 33, nombre: "Usina del hábitat [O2B]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 34, nombre: "Realización Audiovisual [O2A]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 35, nombre: "Gestión y edición publicaciones [O2A]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 36, nombre: "Semiótica [O2B]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 37, nombre: "Comunicación y turismo [O2B]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
            { numero: 38, nombre: "Estética [O2B]", nivel: "IV", duracion: Duración.Cuatrimestral1 },
        ];

        const numToId = new Map<number, number>();

        for (const mData of MATERIAS_DG) {
            let mat = await matRepo.findOne({
                where: { nombre: mData.nombre, carreraId: dgId }
            });

            if (!mat) {
                mat = matRepo.create({ ...mData, carreraId: dgId });
            } else {
                Object.assign(mat, mData);
            }
            await matRepo.save(mat);
            numToId.set(mData.numero, mat.id);
        }
        console.log("✅ Subjects created/updated");

        // 4. Correlativas (Prerequisites)
        // Formato: { materia_num, req_num, tipo }
        const CORRELATIVAS = [
            // Taller I depende de Ingreso
            { m: 5, r: 1, t: TipoCorrelativa.Regularizada },

            // NIVEL 2
            { m: 9, r: 2, t: TipoCorrelativa.Aprobada },
            { m: 9, r: 3, t: TipoCorrelativa.Aprobada },
            { m: 10, r: 4, t: TipoCorrelativa.Aprobada },
            { m: 11, r: 4, t: TipoCorrelativa.Aprobada },
            { m: 11, r: 5, t: TipoCorrelativa.Aprobada },
            { m: 12, r: 6, t: TipoCorrelativa.Regularizada }, // Cursar

            // NIVEL 3
            { m: 16, r: 10, t: TipoCorrelativa.Aprobada },
            { m: 16, r: 9, t: TipoCorrelativa.Aprobada },
            { m: 16, r: 11, t: TipoCorrelativa.Aprobada },
            { m: 16, r: 15, t: TipoCorrelativa.Regularizada },

            { m: 17, r: 13, t: TipoCorrelativa.Regularizada },
            { m: 17, r: 12, t: TipoCorrelativa.Regularizada },

            { m: 18, r: 15, t: TipoCorrelativa.Regularizada },
            { m: 18, r: 14, t: TipoCorrelativa.Regularizada },

            { m: 19, r: 14, t: TipoCorrelativa.Regularizada },

            { m: 20, r: 15, t: TipoCorrelativa.Regularizada },
            { m: 20, r: 14, t: TipoCorrelativa.Regularizada },

            { m: 22, r: 11, t: TipoCorrelativa.Aprobada },
            { m: 22, r: 14, t: TipoCorrelativa.Aprobada },
            { m: 22, r: 19, t: TipoCorrelativa.Regularizada },

            // NIVEL 4
            { m: 25, r: 16, t: TipoCorrelativa.Aprobada },
            { m: 25, r: 18, t: TipoCorrelativa.Regularizada },
            { m: 25, r: 20, t: TipoCorrelativa.Regularizada },

            { m: 26, r: 16, t: TipoCorrelativa.Aprobada },

            { m: 27, r: 11, t: TipoCorrelativa.Aprobada },
            { m: 27, r: 15, t: TipoCorrelativa.Regularizada },

            { m: 28, r: 15, t: TipoCorrelativa.Regularizada },

            { m: 29, r: 16, t: TipoCorrelativa.Aprobada },

            { m: 30, r: 18, t: TipoCorrelativa.Regularizada },

            { m: 31, r: 16, t: TipoCorrelativa.Aprobada },
            { m: 31, r: 12, t: TipoCorrelativa.Aprobada },
            { m: 31, r: 9, t: TipoCorrelativa.Aprobada },
            { m: 31, r: 15, t: TipoCorrelativa.Aprobada },
            { m: 31, r: 17, t: TipoCorrelativa.Regularizada }, // Tech II

            { m: 32, r: 20, t: TipoCorrelativa.Regularizada },
        ];

        // Limpiar previas correlativas de esta carrera (opcional, pero seguro para re-runs)
        // Para simplificar, insertamos las nuevas
        for (const c of CORRELATIVAS) {
            const mId = numToId.get(c.m);
            const rId = numToId.get(c.r);
            if (mId && rId) {
                const exist = await corrRepo.findOneBy({ materiaId: mId, correlativaId: rId, tipo: c.t });
                if (!exist) {
                    await corrRepo.save(corrRepo.create({ materiaId: mId, correlativaId: rId, tipo: c.t }));
                }
            }
        }
        console.log("✅ Prerequisites saved");

    } catch (error) {
        console.error("❌ Error seeding UNNE:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
