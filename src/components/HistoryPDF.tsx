import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 150,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
    },
});

interface HistoryPDFProps {
    historial: HistorialMedico;
}

const HistoryPDF: React.FC<HistoryPDFProps> = ({ historial }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Historial Médico</Text>
                <Text style={styles.subtitle}>
                    Fecha: {new Date(historial.fecha).toLocaleDateString()}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Información del Paciente</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.value}>
                        {historial.persona?.nombre} {historial.persona?.apellido}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Signos Vitales</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Presión Arterial:</Text>
                    <Text style={styles.value}>{historial.presion_arterial}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tipo de Sangre:</Text>
                    <Text style={styles.value}>{historial.tipo_sangre || 'No especificado'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Peso:</Text>
                    <Text style={styles.value}>{historial.peso} kg</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Estatura:</Text>
                    <Text style={styles.value}>{historial.estatura} cm</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Temperatura:</Text>
                    <Text style={styles.value}>
                        {historial.temperatura ? `${historial.temperatura}°C` : 'No especificado'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Nivel de Glucosa:</Text>
                    <Text style={styles.value}>
                        {historial.nivel_glucosa ? `${historial.nivel_glucosa} mg/dL` : 'No especificado'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Descripción</Text>
                <Text>{historial.descripcion || 'Sin descripción'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Profesional Médico</Text>
                <Text>
                    Dr. {historial.profesional?.nombre} {historial.profesional?.apellido}
                </Text>
            </View>
        </Page>
    </Document>
);

export default HistoryPDF;