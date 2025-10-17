// src/screens/ViewResumeScreen.js
import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import Button from "../components/Button";
import { resumeTemplate } from "../utils/pdfTemplate";
// import PdfGenerator from 'react-native-pdf-generator';

const ViewResumeScreen = ({ resume, onBack }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    try {
      setLoading(true);
      const html = resumeTemplate(resume || {});
    
      // Generate PDF
      // const filePath = await PdfGenerator.generate({
      //   html,                             // Your HTML content
      //   fileName: `Resume_${(resume?.name || "profile").replace(/\s+/g,"_")}.pdf`,
      //   directory: 'Documents',            // Optional: save location
      // });

      setLoading(false);
      Alert.alert("PDF generated", `Saved to: ${filePath}`);
    } catch (err) {
      setLoading(false);
      Alert.alert("PDF error", err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{resume?.name || "Your Name"}</Text>
      <Text style={styles.subtitle}>{resume?.title || ""}</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Summary</Text>
        <Text style={styles.body}>{resume?.summary || "—"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Skills</Text>
        <Text style={styles.body}>{(resume?.skills || []).join(", ")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Experience</Text>
        { (resume?.experience || []).length === 0 ? <Text style={styles.body}>—</Text> :
          (resume.experience || []).map((e, i) => (
            <View key={i} style={{marginBottom:8}}>
              <Text style={{fontWeight:"700"}}>{e.role} — {e.company}</Text>
              <Text style={{color:"#6b7280"}}>{e.duration}</Text>
              <Text>{e.desc}</Text>
            </View>
          ))
        }
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Education</Text>
        { (resume?.education || []).map((ed, i) => (
          <View key={i} style={{marginBottom:6}}>
            <Text style={{fontWeight:"700"}}>{ed.degree} — {ed.school}</Text>
            <Text style={{color:"#6b7280"}}>{ed.year} {ed.result ? `| ${ed.result}` : ""}</Text>
          </View>
        )) }
      </View>

      <Button title={loading ? "Generating..." : "Download as PDF"} onPress={generatePDF} />
      <Button title="Back" onPress={onBack} style={{backgroundColor:"#6b7280"}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#6b7280", marginBottom: 12 },
  section: { marginTop: 12 },
  heading: { fontWeight: "700", marginBottom: 6 },
  body: { color: "#374151" }
});

export default ViewResumeScreen;
