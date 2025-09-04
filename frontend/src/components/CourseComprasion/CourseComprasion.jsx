// import React from 'react'
import "./Compare.css"

const CourseComprasion = () => {
    const courses = [
    "CAT 2025 Full Course",
    "CAT 2025 Advance Course",
    "CAT 2025 Advance Course + OMET",
    "Other coaching institutes",
  ];

   const features = [
    "Live Classes",
    "LOD 1, 2, 3 test after each topic",
    "Assignment after each class",
    "30 Mocks tests with complete solution",
    "45 sectional Tests with complete solutions",
    "Mini workshops - 3 hrs/workshop",
    "Recorded course for easy revision",
    "LIVE GD - PI Sessions",
    "Results - 99+ Percentilers",
    "Franchise Vs Company owned",
    "100-99 %le holder faculty",
    "Non - Engineer's Live Maths Foundation classes",
    "Engineer's Book Reading sessions",
    "24 x 7 Doubt solving",
    "Essay Writing + WAT Sessions",
    "Live Current Affair & GK Classes",
    "Live Vocab Classes",
    "Special GE Session",
    "Live Revision classes",
    "Practice sessions after each topic",
    "1-to-1 doubt solving",
    "LOD 4, 5, 6 Tests after each topic",
    "Full Day workshops - 8hrs/workshop",
    "IIM Arithmetic Primer - 400 Questions",
    "IIM Geometry Primer - 400 Questions",
    "IIM Algebra Primer - 400 Questions",
    "IIM Number System Primer - 150 Questions",
    "IIM LR DI Primer - 100 sets",
    "IIM RC Primer - 100 sets",
    "Live Classes - Topper's Batch for IIM",
    "Live Classes on OMET",
    "50 Mocks on OMETs with complete solution",
    "Assignment Discussion after each topic",
    "Printed books",
    "GET INSTANT OFFER",
  ];

   const data = [
    ["500 Hrs", "700 Hrs", "800 Hrs", "200 - 300 Hrs"],
    ["✅", "✅", "✅", "✅"],
    ["✅", "✅", "✅", "✅"],
    ["✅", "✅", "✅", "Less in numbers"],
    ["✅", "✅", "✅", "Less in numbers"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["1200+", "1200+", "1200+", "200-500"],
    ["Company owned", "Company owned", "Company owned", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["✅", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "✅", "✅", "❌"],
    ["❌", "❌", "✅", "❌"],
    ["❌", "❌", "✅", "❌"],
    ["❌", "❌", "✅", "❌"],
    ["❌", "88 Books", "88 Books", "❌"],
    ["Book Now", "Book Now", "Book Now", "Learn More"],
  ];
  return (
    <div>
       <div className="ts-compare-container">
  <h2 className="ts-compare-heading">CAT Course Comparison</h2>
  <div className="ts-compare-scroll-wrapper">
    <table className="ts-compare-table">
      <thead>
        <tr className="ts-compare-header">
          <th>Course Features</th>
          {courses.map((course, index) => (
            <th key={index}>{course}</th>
          ))}
        </tr>
      </thead>
      <tbody className="ts-compare-body">
        {features.map((feature, i) => (
          <tr
            key={i}
            className={
              i === features.length - 1 ? "ts-sticky-row" : ""
            }
          >
            <td className="ts-compare-feature-cell">{feature}</td>
            {data[i].map((val, j) => (
             <td
  key={j}
  className="ts-compare-value-cell"
  style={{
    backgroundColor:
      val === "GET INSTANT OFFER" || val === "Book Now"
        ? "green"
        : val === "Learn More"
        ? "red"
        : "inherit",
    color:
      val === "GET INSTANT OFFER" || val === "Book Now" || val === "Learn More"
        ? "white"
        : "inherit",
    fontWeight:
      val === "GET INSTANT OFFER" || val === "Book Now" || val === "Learn More"
        ? "bold"
        : "normal",
    textAlign: "center",
  }}
>
  {val}
</td>

            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

    </div>
  )
}

export default CourseComprasion
