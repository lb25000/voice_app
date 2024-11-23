// CommonStyles.tsx
import { StyleSheet } from 'react-native';

const CommonStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //paddingLeft: 40,
        //padding: 30, //16,
        backgroundColor: 'f0f0f0', // Hintergrundfarbe für die gesamte Seite
    },
    header: {
        width: '100%', // Breite des Headers
        height: 60, // Höhe des Headers
        backgroundColor: '#6200ee', // Hintergrundfarbe des Headers
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        //fontWeight: 'bold',
        color: 'white', // Schriftfarbe im Header
        paddingBottom: 16,
        textAlign: 'center',
    },
    roundButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        backgroundColor: '#e4DBff',
        position: 'absolute',
        bottom: 20,
        left: '70%',
        //right: '10%', // Fake fix^^
        //transform: [{ translateX: -25 }],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000', // Schattenfarbe
        shadowOffset: { width: 0, height: 4 }, // Richtung und Entfernung des Schattens
        shadowRadius: 5, // Weichheit des Schattens
    },
});

export default CommonStyles;

// blau grau baCacE
// alt rosa C5B2B0
// flieder D5B9ed
