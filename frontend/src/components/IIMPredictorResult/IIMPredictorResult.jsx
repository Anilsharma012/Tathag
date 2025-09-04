import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./IIMPredictorResult.css";
import IIMPredictionpage from "../../subpages/IIMPredictionPage/IIMPredictionpage";

const IIMPredictorResult = () => {
  const { userId } = useParams();
  const [visibleColleges, setVisibleColleges] = useState(5); // Pehle sirf 5 dikhayenge
  const [predictionData, setPredictionData] = useState({
    name: "N/A",
    category: "N/A",
    classX: "N/A",
    classXII: "N/A",
    graduation: "N/A",
    gradPercentage: "N/A",
    workExperience: "N/A",
    matchedSchools: 0,
    schools: [], // ✅ Default empty array taaki `.map()` error na de
  });

  const collegeData = [
    {
      name: "IIM Ahmedabad",
      highestPackage: "61.49 Lakh",
      avgPackage: "32.8 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "IIM Bangalore",
      highestPackage: "80 Lakh",
      avgPackage: "35.31 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "IIM Calcutta",
      highestPackage: "115 Lakh",
      avgPackage: "35.07 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "ISB:700+ (Via GMAT)",
      highestPackage: "100 Lakh",
      avgPackage: "34.07 Lakh",
      status: "Good Probability",
      exam: "GMAT",
    },
    {
      name: "XLRI: 94%ile (Via XAT)",
      highestPackage: "78.2 Lakh",
      avgPackage: "32.7 Lakh",
      status: "Good Probability",
      exam: "XAT",
    },
    {
      name: "IIM Lucknow",
      highestPackage: "55 Lakh",
      avgPackage: "32.2 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "FMS Delhi",
      highestPackage: "112 Lakh",
      avgPackage: "34.1 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "SP Jain",
      highestPackage: "77.8 Lakh",
      avgPackage: "33 Lakh",
      status: "Good Probability",
      exam: "CAT",
    },
    {
      name: "IIM Kozhikode",
      highestPackage: "67.02 Lakh",
      avgPackage: "31.02 Lakh",
      status: "Less Probability",
      exam: "CAT",
    },
    {
      name: "IIM Indore",
      highestPackage: "114 Lakh",
      avgPackage: "30.21 Lakh",
      status: "Less Probability",
      exam: "CAT",
    },
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictionData = async () => {
        try {
            const response = await axios.get(`/api/v2/iim-predictor/${userId}`);
            
            console.log("✅ API Response Data:", response.data); // 🔍 Debugging line

            setPredictionData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching prediction data:", error);
            setLoading(false);
        }
    };

    fetchPredictionData();
}, [userId]);


  if (loading) {
    return <div className="loading-spinner">Loading results...</div>;
  }

  // ✅ Load More Function
  const handleLoadMore = () => {
    setVisibleColleges((prev) => prev + 5);
  };

  // ✅ Show Less Function
  const handleShowLess = () => {
    setVisibleColleges(5);
  };

  return (
    <div>
    <div className="prediction-container">
      <h2>🎉 Congratulations {predictionData.name}!</h2>
      <p>
        Your profile matches <b>{predictionData.matchedSchools}</b> Top
        B-Schools
      </p>

      <div className="user-summary">
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>CLASS X</th>
              <th>CLASS XII</th>
              <th>GRADUATION</th>
              <th>WORK EXP.</th>
            </tr>
          </thead>
          <tbody>
          <tr>
    <td>{predictionData.name}</td>  {/* ✅ Yeh name ab database se aa raha hai */}
    <td>{predictionData.category}</td>
    <td>{predictionData.classX}%</td>
    <td>{predictionData.classXII}%</td>
    <td>{predictionData.graduation} ({predictionData.gradPercentage}%)</td>
    <td>{predictionData.workExperience} months</td>
</tr>
          </tbody>
        </table>
      </div>

      <div className="prediction-container">
        <h2>B-Schools You Can Crack 🎓</h2>
        <p>
          Based upon your profile details and the criteria for shortlisting used
          by different IIMs.
        </p>

        <table className="college-table">
          <thead>
            <tr>
              <th>COLLEGE NAME</th>
              <th>HIGHEST PACKAGE</th>
              <th>AVG. PACKAGE</th>
              <th>YOUR STATUS</th>
              <th>EXAMS</th>
            </tr>
          </thead>
          <tbody>
            {collegeData.slice(0, visibleColleges).map((college, index) => (
              <tr key={index}>
                <td>{college.name}</td>
                <td>{college.highestPackage}</td>
                <td>{college.avgPackage}</td>
                <td
                  className={
                    college.status.includes("Good")
                      ? "status-good"
                      : "status-moderate"
                  }
                >
                  {college.status}
                </td>
                <td>{college.exam}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Buttons for Load More & Show Less */}
        <div className="button-container">
          {visibleColleges < collegeData.length && (
            <button onClick={handleLoadMore} className="load-more-btn">
              Load More
            </button>
          )}
          {visibleColleges > 5 && (
            <button onClick={handleShowLess} className="show-less-btn">
              Show Less
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem(`iim-predictor-${userId}`);
          window.location.href = "/";
        }}
        className="reset-btn"
      >
        🔄 Recalculate
      </button>
      </div>


      <div>
      <IIMPredictionpage/>
      </div>
    </div>
  );
};

export default IIMPredictorResult;
