import React from 'react'
import "./Tips.css"
import TipOne from "../../images/TipOne.png"
import TipTwo from "../../images/7.jpg"

import ourBlogTwo from "../../images/ourBlogTwo.png"
// import ourBlogThree from "../../images/ourBlogThree.png"
import ourBlogFour from "../../images/ourBlogFour.png"
import LazyImage from '../../components/LazyImage/LazyImage';
import { useNavigate } from 'react-router-dom'
import faqImage from "../../images/faqOne.png"

const journals = [
  {
    id: 1,
    image: ourBlogTwo,
    date: "Feb 24, 2025",
    title: "Best Books for CUET Preparation UG 2024",
  },
  {
    id: 2,
    image: TipOne,
    date: "Feb 24, 2025",
    title: "CUET 2024: Recommended Study Materials",
  },
  {
    id: 3,
    image: ourBlogFour,
    date: "Feb 24, 2025",
    title: "Top Reference Guides for CUET UG 2024",
  },
];


const Tips = () => {
  const navigate=useNavigate()
  return (
    <div>
      
      <div className="tips-container">
      <h1 className="tips-heading">Top 5 Time Management Tips for CAT Aspirants</h1>

      <div className="tips-meta">
        {/* <p>
          <span role="img" aria-label="user">👤</span> Tathagat Faculty
        </p> */}
        <p>
          <span role="img" aria-label="calendar">🕒</span> April 26, 2025
        </p>
      </div>

      <LazyImage
        src={TipOne} // Apna image yahan daalna
        alt="Students discussing tips"
        className="tips-image"
      />
    </div>



    <div className="tips-detail-content">
      <h2 className="section-title">Introduction:</h2>
      <p>
        Managing time during preparation — and during the exam itself — can make or break your CAT score.
        It’s not just about how much you know; it’s about how efficiently you apply that knowledge under pressure.
        Many bright students lose marks not because they didn’t know the answer, but because they spent too
        much time on tough questions, panicked under time pressure, or couldn’t plan their preparation well.
        The good news? Time management is a skill you can learn and master — with the right approach and consistent practice.
        <br /><br />
        Here are five proven strategies straight from CAT toppers and Tathagat mentors that can help you maximize every minute.
      </p>

      <h3 className="tip-heading">1. Prioritize High-Impact Topics</h3>
      <p>
        Not all topics are created equal. Some areas consistently carry more weight in the exam —
        mastering these gives you a better return on your time investment.
        <br />✔ Identify the most important topics based on past CAT papers (e.g., Arithmetic, Algebra in Quant; Reading Comprehension in Verbal).
        <br />✔ Devote more time to mastering these before moving to less-weighted areas.
        <br /><strong>Tip:</strong> <br />
        Create a simple checklist and update it weekly to track your command over high-impact topics.
      </p>

      <h3 className="tip-heading">2. Train Early with Full-Length Mocks</h3>
      <p>
        Mocks are your best friends.
        <br />✔ Start taking full-length mock tests early — ideally 3–4 months before the exam.
        <br />✔ Analyze your performance: look beyond scores; check where you spent too much time, where you guessed, and where you skipped.
        <br /><strong>Important:</strong> <br />
        Mock tests should simulate real exam conditions — same time slots, same environment, and no distractions.
      </p>

      <h3 className="tip-heading">3. Master the Art of Skipping</h3>
      <p>
        Time management inside the exam hall is all about smart decision-making.
        <br />✔ Don’t get emotionally attached to questions.
        <br />✔ If a question looks lengthy, tricky, or confusing in the first few seconds, skip it and move on.
        <br />✔ Come back later if time permits — after all, CAT rewards accuracy, not ego!
        <br /><strong>Remember:</strong> <br />
        Sometimes, not attempting a tough question is a winning move.
      </p>
    </div>
    




    {/* <section className="cta-section">
  <div className="cta-text">
    <h2>Don't Just Dream It. Crack It <br />with Tathagat!</h2>
    <button className="cta-btn" onClick={()=>navigate("/GetInTouch")}>Contact Now</button>
  </div>
  <div className="cta-image">
    <LazyImage src={require('../../images/ourBlogFive.png')} alt="Brain" />
  </div>
</section> */}

  <div className="tf-section-wrapper">
  {/* Left Box */}
  <div className="tg-telegram-box">
    <h2 className="tg-heading">Join Our Telegram Channel</h2>
    <p className="tg-subtext">
      Get instant updates on exam strategies, free study materials, daily quizzes,
      important deadlines, and direct mentor tips — all in one place.
    </p>

    <div className="tg-tags">
      <span className="tg-tag">✅ Exclusive Resources</span>
      <span className="tg-tag">✅ Doubt-Solving With Mentors</span>
      <span className="tg-tag">✅ GK & Current Affairs Updates</span>
      <span className="tg-tag">✅ Peer Discussions And Motivation</span>
    </div>

    <p className="tg-bottom-text">
      <span className="tg-highlight">Be part of the TathaGat learning community!</span>
    </p>
  </div>

  {/* Right Box */}
  <div
    className="tf-telegram-box"
    style={{ backgroundImage: `url(${faqImage})` }}
  >
    <div className="tf-telegram-overlay">
      <h3 className="tf-telegram-text">
        Join our Free Telegram<br />Discussion Group!
      </h3>
      <button className="tf-telegram-btn">Join now</button>
    </div>
  </div>
</div>






<div className="final-tips-wrapper">
      <LazyImage
        src={TipTwo} // <-- yahan apna image path dena
        alt="Exam Hall"
        className="final-tips-image"
      />

      <div className="final-tip">
        <h3>4. Study in Small, Intense Bursts</h3>
        <p>
          Long study hours without focus can drain your energy without real progress.
          <br />✔ Instead, use techniques like Pomodoro (25 minutes focused study + 5 minutes break).
          <br />✔ Break your day into 2–3 focused sessions — Quant in the morning, Verbal and LRDI in the evening.
          <br /><strong>Example Routine:</strong>
          <br />• 8 AM – 10 AM: Quantitative Aptitude practice
          <br />• 5 PM – 6:30 PM: Verbal Ability practice
          <br />• 9 PM – 10 PM: Mock Analysis
        </p>
      </div>

      <div className="final-tip">
        <h3>5. Build Exam-Day Endurance</h3>
        <p>
          CAT is a 2-hour mental marathon. You must train your brain for sustained focus.
          <br />✔ Practice sitting for long periods without distractions.
          <br />✔ Take back-to-back mocks closer to the exam day to build stamina.
          <br /><strong>Pro Tip:</strong>
          <br />Simulate the emotional pressure too — treat mocks seriously so you get used to performing under stress.
        </p>
      </div>

      <div className="final-conclusion">
        <h3>Conclusion</h3>
        <p>
          Time management isn’t a trick you pull out on exam day — it’s a habit you build over months of smart preparation.
          <br />
          Start applying these strategies now. Break your studies into achievable goals. Practice under pressure. Stay consistent.
          <br />
          By exam day, time will no longer be your enemy — it will be your secret weapon.
        </p>
      </div>
    </div>





    <div className="related-journals-section">
      <h2 className="journal-heading">Related Journal Entries</h2>
      <div className="journal-card-container">
        {journals.map((journal) => (
          <div className="journal-card" key={journal.id}>
            <LazyImage src={journal.image} alt={journal.title} className="journal-img" />
            <div className="journal-overlay">
              <div className="journal-date">📅 {journal.date}</div>
              <div className="journal-title">{journal.title}</div>
              <div className="journal-icon">➜</div>
            </div>
          </div>
        ))}
      </div>
    </div>


    </div>
  )
}

export default Tips
