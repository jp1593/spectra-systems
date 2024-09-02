"use client";
import dynamic from "next/dynamic";
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    rowGap: 30,
    padding: 10,
    flexGrow: 1,
  },
  viewer: {
    width: "100vw",
    height: "100vh",
    fontFamily: "__Inter_aaf875",
  },
  title: {
    borderBottom: "1px solid #000",
    paddingBottom: 10,
  },
  main: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sideSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: 40,
  },
  textSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: 10,
  },
  total: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    rowGap: 10,
    paddingTop: 10,
    borderTop: "1px solid #000",
  },
});

export const MyDocument = ({ reservation }: { reservation: Reservation }) => (
  <PDFViewer style={styles.viewer}>
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Reservation #{reservation._id}</Text>
          <View style={styles.main}>
            <View style={styles.sideSection}>
              <View style={styles.textSection}>
                <Text>Buyer</Text>
                <Text>{reservation.user.firstName + " " + reservation.user.lastName}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Reservation Made At</Text>
                <Text>{reservation.madeAt}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Room Purchased</Text>
                <Text>{reservation.roomType}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Room Price</Text>
                <Text>{reservation.roomPrice} USD</Text>
              </View>
            </View>
            <View style={styles.sideSection}>
              <View style={styles.textSection}>
                <Text>Check-in Date</Text>
                <Text>{reservation.checkin}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Check-out Date</Text>
                <Text>{reservation.checkout}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Stay In Days</Text>
                <Text>{reservation.stayDays}</Text>
              </View>
              <View style={styles.textSection}>
                <Text>Guests</Text>
                <Text>{reservation.guests}</Text>
              </View>
            </View>
          </View>
          <View style={styles.total}>
            <Text>Total Price</Text>
            <Text>{reservation.totalPrice} USD</Text>
          </View>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);
