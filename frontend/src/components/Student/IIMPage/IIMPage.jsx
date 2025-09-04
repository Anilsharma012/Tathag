import React, { useEffect, useState } from "react";
import "./IIMPage.css";

const IIMPage = ({ user }) => {
    const [predictorData, setPredictorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user || !user.id) {
                    throw new Error("User ID is missing");
                }

                const response = await fetch(`/api/v2/iim-predictor/${user.id}`);
                
                if (!response.ok) {
                    throw new Error("Failed to fetch IIM Predictor Data");
                }

                const data = await response.json();
                console.log("✅ IIM Predictor Data:", data);
                setPredictorData(data);
            } catch (err) {
                console.error("❌ Error fetching predictor data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <h2>Loading IIM Predictor Data...</h2>;
    if (error) return <h2>{error}</h2>;
    if (!predictorData) return <h2>No Data Found</h2>;

    return (
        <div className="iim-predictor-container">
            <h2>IIM Predictor Details</h2>
            <table>
                <tbody>
                    <tr><td><strong>Category:</strong></td> <td>{predictorData.category}</td></tr>
                    <tr><td><strong>Gender:</strong></td> <td>{predictorData.gender}</td></tr>
                    <tr><td><strong>Class X Marks:</strong></td> <td>{predictorData.classX}</td></tr>
                    <tr><td><strong>Class XII Marks:</strong></td> <td>{predictorData.classXII}</td></tr>
                    <tr><td><strong>Discipline:</strong></td> <td>{predictorData.discipline}</td></tr>
                    <tr><td><strong>Graduation:</strong></td> <td>{predictorData.graduation}</td></tr>
                    <tr><td><strong>Graduation Percentage:</strong></td> <td>{predictorData.gradPercentage}</td></tr>
                    <tr><td><strong>Work Experience:</strong></td> <td>{predictorData.workExperience} Years</td></tr>
                    <tr><td><strong>Taken CAT Before:</strong></td> <td>{predictorData.takenCATBefore}</td></tr>
                    <tr><td><strong>CAT Exam Year:</strong></td> <td>{predictorData.catYear}</td></tr>
                    <tr>
                        <td><strong>Interested Courses:</strong></td> 
                        <td>{predictorData.interestedCourses ? predictorData.interestedCourses.join(", ") : "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default IIMPage;
