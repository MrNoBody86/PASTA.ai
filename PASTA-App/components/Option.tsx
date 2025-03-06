import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Defining the types for the props expected by the Option component
interface Props {
    option: string;               // Text to display for the option
    isSelected: boolean;          // Indicates if this option is selected
    checkIfSelected: () => void;  // Function to check if the option is selected
    setSelectedOption: any;       // Function to update the selected option
}

// Option component for rendering selectable options
const Option = ({ option, isSelected, checkIfSelected, setSelectedOption }: Props) => {

    // Handles the selection of an option
    const handleSelect = () => {
        setSelectedOption(option);  // Update the selected option
        checkIfSelected();          // Call function to check selection status
    };

    return (
        <TouchableOpacity 
            onPress={handleSelect} 
            activeOpacity={0.8} 
            style={[
                styles.option, 
                { backgroundColor: isSelected ? "#ABD1C6" : "#FFF" } // Change background if selected
            ]}
        >
            <Text style={{ fontWeight: "500" }}>{option}</Text>
        </TouchableOpacity>
    );
};

export default Option;

const styles = StyleSheet.create({
    option: {
        width: "100%",
        height: 45,
        borderRadius: 16,
        paddingHorizontal: 12,
        justifyContent: "center",
        marginBottom: 20,
        backgroundColor: "#fff"
    },
});
