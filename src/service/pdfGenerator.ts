import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { HistorialMedico } from '../pages/[id]';

const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const generateHistorialPDF = async (historial: HistorialMedico) => {
    const pdf = new jsPDF();
    const imgData = 'LOGO_EN_BASE64';

    pdf.addImage(imgData, 'PNG', 10, 10, 30, 30);
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Historial Médico', 105, 30, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(52, 73, 94);
    pdf.text(`Fecha: ${formatDate(historial.fecha)}`, 105, 40, { align: 'center' });
    pdf.text(`Código: #${historial.cod_historial}`, 105, 45, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setTextColor(41, 128, 185);
    pdf.text('Información del Paciente', 15, 60);

    const pacienteInfo = [
        ['Nombre Completo:', `${historial?.persona?.nombre} ${historial?.persona?.apellido}`],
        ['Fecha de Nacimiento:', historial?.persona?.fecha_nacimiento ? formatDate(historial.persona.fecha_nacimiento) : 'No especificada'],
        ['Género:', historial?.persona?.genero || 'No especificado'],
        ['Teléfono:', historial?.persona?.telefono || 'No especificado'],
        ['Email:', historial?.persona?.email || 'No especificado'],
        ['Dirección:', historial?.persona?.direccion || 'No especificada']
    ];

    (pdf as any).autoTable({
        startY: 65,
        head: [],
        body: pacienteInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    pdf.setFontSize(16);
    pdf.setTextColor(41, 128, 185);
    pdf.text('Signos Vitales', 15, pdf.lastAutoTable.finalY + 20);

    const signosVitales = [
        ['Presión Arterial:', historial.presion_arterial],
        ['Tipo de Sangre:', historial.tipo_sangre || 'No especificado'],
        ['Peso:', `${historial.peso} kg`],
        ['Estatura:', `${historial.estatura} cm`],
        ['Temperatura:', historial.temperatura ? `${historial.temperatura}°C` : 'No especificada'],
        ['Nivel de Glucosa:', historial.nivel_glucosa ? `${historial.nivel_glucosa} mg/dL` : 'No especificado']
    ];

    (pdf as any).autoTable({
        startY: pdf.lastAutoTable.finalY + 25,
        head: [],
        body: signosVitales,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    if (historial?.diagnosticos?.length) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185);
        pdf.text('Diagnósticos', 15, 20);

        const diagnosticosData = historial.diagnosticos.map(d => [
            formatDate(d.fecha),
            d.descripcion,
            d.estado ? 'Activo' : 'Inactivo'
        ]);

        (pdf as any).autoTable({
            startY: 25,
            head: [['Fecha', 'Descripción', 'Estado']],
            body: diagnosticosData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });
    }

    if (historial?.tratamientos?.length) {
        if (pdf.lastAutoTable.finalY > 200) pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185);
        pdf.text('Tratamientos', 15, pdf.lastAutoTable.finalY + 20);

        const tratamientosData = historial.tratamientos.map(t => [
            formatDate(t.fecha_inicio),
            t.fecha_fin ? formatDate(t.fecha_fin) : 'En curso',
            t.descripcion,
            t.estado ? 'Activo' : 'Finalizado'
        ]);

        (pdf as any).autoTable({
            startY: pdf.lastAutoTable.finalY + 25,
            head: [['Fecha Inicio', 'Fecha Fin', 'Descripción', 'Estado']],
            body: tratamientosData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });
    }

    if (historial?.examenes?.length) {
        if (pdf.lastAutoTable.finalY > 200) pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185);
        pdf.text('Exámenes', 15, pdf.lastAutoTable.finalY + 20);

        const examenesData = historial.examenes.map(e => [
            formatDate(e.fecha),
            e.tipo,
            e.descripcion,
            e.resultados || 'Pendiente',
            e.estado ? 'Completado' : 'Pendiente'
        ]);

        (pdf as any).autoTable({
            startY: pdf.lastAutoTable.finalY + 25,
            head: [['Fecha', 'Tipo', 'Descripción', 'Resultados', 'Estado']],
            body: examenesData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });
    }

    pdf.setFontSize(10);
    pdf.setTextColor(52, 73, 94);
    const profesionalText = `Atendido por: Dr. ${historial?.profesional?.nombre} ${historial?.profesional?.apellido}`;
    const especialidadText = historial?.profesional?.especialidad ? 
        `Especialidad: ${historial.profesional.especialidad}` : '';
    
    pdf.text(profesionalText, 15, pdf.internal.pageSize.height - 20);
    if (especialidadText) {
        pdf.text(especialidadText, 15, pdf.internal.pageSize.height - 15);
    }

    return pdf;
};