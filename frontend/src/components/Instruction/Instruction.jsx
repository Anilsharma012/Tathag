
import "./Instruction.css"
import tableImage from '../../images/tablecontent.jpeg'; 
import { GoZoomIn } from "react-icons/go";
import { AiOutlineZoomOut } from "react-icons/ai";

const Instruction = () => {
  return (
    <div>


<div className="instructions-container">
      <div className="header-blue">
        <strong>Instructions</strong>
        <span className="close-btn">Close ✖</span>
      </div>
      <div className="note">Note that the timer is ticking while you read the instructions. Close this page to return to answering the questions.</div>

      <div className="scrollable-content">
        <h3 style={{ textAlign: 'center', color: '#2a64d3' }}>Instructions</h3>

        <h2><strong>General Instructions:</strong></h2>

        <p><strong>1. The number, type and pattern of questions, as well as sequence and timing of sections in the Mock Exam are only indicative and these are subject to variations from year to year as decided by the CAT authorities.</strong></p>

        <p>2. The test has 3 (three) sections. The total duration of the test is 120 minutes. PwD candidates will have 13 minutes and 20 seconds extra time for each section.</p>

        <p>3. The time allotted to each section is 40 minutes (53 minutes and 20 seconds for PwD candidates)...</p>

        <p>4. You will be allowed to leave the test hall only after a minimum of 120 minutes.</p>

        <p><strong>5.</strong> Your time will be set and synchronized... <strong>When the timer reaches zero, the test for that section will automatically end.</strong></p>

        <p><strong>6.</strong> The question paper will have a mix of <strong>Multiple Choice Question (MCQ)</strong> type with options and <strong>Non-MCQ type.</strong></p>

        <p><strong>7.</strong> A writing pad will be provided... <strong>Please note that only one writing pad will be provided to you.</strong></p>

        <p><strong>8.</strong> An on-screen calculator will be provided...</p>

        <p><strong>9.</strong> The question palette displayed on the right side of the screen will show the status of each question with the help of one of the following symbols:</p>
{/* <div className="tgv-table-wrapper"> */}
  {/* <table className="tgv-status-table">
    <thead>
      <tr>
        <th>S. No.</th>
        <th>Question Status</th>
        <th>Meaning</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A</td>
      <td><img src="https://img.icons8.com/ios/50/000000/1-circle.png" alt="Not Visited" /></td> 

        <td>You have not visited the question yet.</td>
      </tr>
      <tr>
        <td>B</td>
       <td><img src="https://img.icons8.com/ios/50/000000/3-circle.png" alt="3" /></td> 
        <td>You have visited the question but have not answered it.</td>
      </tr>
      <tr>
        <td>C</td>
        <td><img src="https://img.icons8.com/ios/50/000000/5-circle.png" alt="5" /></td>
        <td>You have answered the question but have not flagged it as Marked for Review.</td>
      </tr>
      <tr>
        <td>D</td>
        <td><img src="https://img.icons8.com/ios/50/000000/7-circle.png" alt="7" /></td>
        <td>You have not answered the question but have flagged it as Marked for Review.</td>
      </tr>
      <tr>
        <td>E*</td>
        <td><img src="https://img.icons8.com/ios/50/000000/0-circle.png" alt="0" /></td>
        <td>You have answered the question as well as flagged it as Marked for Review.</td>
      </tr>
    </tbody>
  </table> */}
<div className="tgv-table-wrapper">
  <img
    src={tableImage}
    alt="Question Status Table"
style={{
      width: "100%",
      maxWidth: "700px",
      display: "block", 
      margin: "0", // left aligned
    }}  />
</div>





        <p style={{ fontSize: '13px' }}>
          *Answers to all questions flagged as <strong>‘Marked for Review’</strong> (Serial No. E) will be automatically considered as submitted for evaluation at the end of the time allotted for that section.
        </p>

<p><strong>10.</strong> You can click on the "&lt;" arrow which appears to the left of the question palette to collapse the question palette and maximize the window. To view the question palette again, you can click on the "&gt;" which appears on the right side of the computer console.</p>
     
      <h4>11. <strong>To answer a question, you will need to do the following:</strong></h4>
        <p>a. Click on the question number in the question palette to go to that question directly.</p>
        <p>b. Select an answer for an <strong>MCQ</strong> by clicking on the radio button ( ) placed just before the choice.</p>
        <p><strong>For a Non-MCQ, enter only a whole number</strong> as the answer in the space provided on the screen using the on-screen keyboard. For example, if the correct answer to a Non-MCQ is 50, then enter <strong>ONLY</strong> 50 and <u>NOT</u> 50.0 or 050 etc.</p>
        <p>c. Click on <strong>‘Save & Next’</strong> to save your answer for the current question and then go to the next question.</p>
        <p>Alternatively, you may click on <strong>‘Mark for Review & Next’</strong> to save your answer for the current question and mark it for your review at any time before the completion of the section, and then move to the next question.</p>
<p style={{ color: 'black', fontWeight: 'bold' }}>
  <strong>Caution:</strong> Your answer for the current question will not be saved, if you navigate directly to another question by clicking on a question number and not click ‘Save & Next’ or ‘Mark for Review & Next’ button.
</p>
        <p>d. You will be able to view all the questions of a section by clicking on the <strong>‘Question Paper’</strong> button. <span style={{ textDecoration: 'underline' }}>This feature is provided for you to see the entire question paper of a particular section.</span></p>
      <h4>12. <strong>Procedure for changing your response to a question:</strong></h4>
        <p>a. To deselect your chosen answer, click on the <strong>question number</strong> on the question palette and click on the <strong>‘Clear Response’</strong> button.</p>
        <p>b. To change your chosen answer, click on the radio button corresponding to another option.</p>
        <p>c. To save your changed answer, you <strong>must</strong> click on the <strong>‘Save & Next’</strong> or <strong>‘Mark for Review & Next’</strong> button.</p>

        <h4>13. <strong>Navigating through Sections:</strong></h4>
        <p>a. The test has three sections administered in the following order: I. Verbal Ability and Reading Comprehension (VARC), II. Data Interpretation and Logical Reasoning (DILR), and III. Quantitative Ability (QA). The names of the three sections are displayed on the top bar of the screen. The section you are currently viewing is highlighted.</p>
        <p>b. From any section, you will be able to move to the next section only after completing a minimum of 40 minutes, i.e., after the time allocated to that section for non-PwD candidates.</p>
<p>
  c. PwD candidates with blindness and low vision (or VI candidates) will have the screen magnification option enabled by default and will find two magnifying glass icons at the top of the screen.
  You can click on  <GoZoomIn style={{ color: "rgb(131, 77, 7)", width: "50px",height:"30px" }} />
and click on
<AiOutlineZoomOut style={{ color: "rgb(131, 77, 7)", width: "50px",height:"30px" }} />


  

  to zoom out the question.
</p>
      


        <ol style={{ marginTop: '20px', marginBottom: '30px' }}>
          <li>16x Pixel - Default View</li>
          <li>21x Pixel - Level 1</li>
          <li>24x Pixel - Level 2</li>
        </ol>

        <h4 style={{ textAlign: 'center', color: '#2a64d3' }}>Other Important Instructions</h4>

        <h4><strong>Subject Specific Instructions:</strong></h4>
        <p>1. To login, enter your registration number and password following instructions provided to you by the invigilator.</p>
        <p>2. Go through the various symbols used in the test and understand their meaning before you start the test.</p>
        <p>3. The question paper consists of 3 (three) sections:</p>

        <table className="tgv-status-table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Test</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>I</td>
              <td>Verbal Ability and Reading Comprehension (VARC)</td>
            </tr>
            <tr>
              <td>II</td>
              <td>Data Interpretation and Logical Reasoning (DILR)</td>
            </tr>
            <tr>
              <td>III</td>
              <td>Quantitative Ability (QA)</td>
            </tr>
          </tbody>
        </table>

        <p>4. The Data Interpretation and Logical Reasoning (DILR) section each problem is based on situations or scenarios and can have any number of sub questions. Similarly, for Reading Comprehension, each passage consists of a group of four questions.</p>

        <p><strong>5.</strong> For an <strong>MCQ</strong>, a candidate will be given <strong>3 (three) marks for a correct answer, -1 (minus one) mark for a wrong answer and a 0 (zero) mark for an un-attempted question.</strong></p>

        <p><strong>6.</strong> For a <strong>Non-MCQ</strong>, a candidate will be given <strong>3 (three) marks for a correct answer, and a 0 (zero) mark for a wrong answer as well as for an un-attempted question.</strong> There will be <strong>no negative mark for a wrong answer in a Non-MCQ.</strong></p>

        <p>7. An MCQ will have choices out of which only one will be the correct answer. The computer allotted to you at the test centre runs on a specialized software that permits you to select only one answer for an MCQ. You will have to choose the correct answer by clicking on the radio button ( ) placed just before the option. For a Non-MCQ, you will have to enter only a whole number as the answer in the space provided on the screen using the on-screen keyboard.</p>

        <p>8. Your answers will be updated and saved on a server periodically. The test will end automatically at the end of <strong>120 minutes</strong> (or at the end of <strong>160 minutes for PwD candidates</strong>). The time allotted for each section will be 40 minutes (or 53 minutes and 20 seconds for PwD candidates), after which you will not be allowed to go back to the earlier section(s).</p>

     
<h4><b>Declaration by a Candidate:</b></h4>
<ol type="i" style={{marginLeft: "25px;"}}>
  <li style={{marginBottom: "20px;"}}>
    I have read and understood all the above instructions. I have also read and understood clearly the instructions given on the admit card and CAT website and shall follow the same. I declare that I am not wearing/carrying/in possession of any electronic communication gadgets or any prohibited material with me into the examination hall. I also understand that in case I violate any of these instructions, my candidature is liable to be cancelled and/or disciplinary action taken which may include debarring me from future tests and examinations.
  </li>
  <li style={{marginBottom: "20px;"}}>
    I confirm that at the start of the test, all computer hardware and software allotted to me are in working condition.
  </li>
  <li style={{marginBottom: "10px;"}}>
    I will not disclose, publish, reproduce, transmit, store, or facilitate transmission and storage of the contents of the CAT or any information therein in whole or part thereof in any form or by any means, verbal or written, electronically or mechanically for any purpose. <i>I am aware that this shall be in violation of the Indian Contract Act, 1872 and/or the Copyright Act, 1957 and/or the Information Technology Act, 2000. I am aware that such actions and/or abetment thereof as aforementioned may constitute a cognizable offence punishable with imprisonment for a term up to three years and fine up to Rs. Two Lakhs.</i>
  </li>
</ol>

     
     
      </div>
      </div>
    


    </div>
  )
}

export default Instruction;