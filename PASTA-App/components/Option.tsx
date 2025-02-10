import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    option: string
    isSelected: boolean
    checkIfSelected: ()=> void
    setSelectedOption: any
}

const Option = ({option, isSelected, checkIfSelected, setSelectedOption}:Props) => {

    const handleSelect = () => {
        setSelectedOption(option)
        checkIfSelected()
    }

  return (
    <TouchableOpacity onPress={handleSelect} activeOpacity={0.8} style={[styles.option, { backgroundColor: isSelected ? "#ABD1C6" : "#FFF" }]}>
      <Text style={{ fontWeight: "500" }} >{option}</Text>
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
