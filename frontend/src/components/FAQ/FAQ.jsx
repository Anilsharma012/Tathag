import React,{useState} from 'react'
import "./FAQ.css"

const faqs = [
  {
    question: "What courses does TathaGat offer?",
    answer:
      "We offer preparation courses for CAT, XAT, SNAP, GMAT, CUET, and other management entrance exams. Our programs include concept classes, question-solving sessions, workshops, strategy sessions, and extensive doubt discussions.",
  },
  {
    question: "What makes TathaGat different from other coaching institutes?",
    answer:"Our pedagogy, unique blend of traditional and modern teaching methods make us different from any other coaching institute. Tathagat was founded in 2007 because the founders identified many problems in the way coaching institutes were operating. We started initiated changes leading to a paradigm shift in this industry. Our exhaustive classroom exposure, marathon workshops, annually updated packages, mandatory discussion classes after each topic, unlimited one-to-one doubt-sessions transformed the way students were being mentored.",
      
  },
{
  question: "How can I track my progress at TathaGat?",
  answer: (
    <span className="text-base leading-relaxed">
      You can track your progress by logging in and checking your{" "}
      <a
        href="/student/dashboard"
        className="inline-block px-2.5 py-0.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition"
      >
        Student LMS
      </a>.
    </span>
  ),
}

,
  {
    question: "Does TathaGat offer online classes?",
    answer:
        "Yes, Tathagat offers both Online & Offline classes. The Online classes are live and students have access to all the recorded lectures as well. The online course is as rigorous and extensive as the offline classes. We also follow the Module System, which makes our course the most unique in the industry. Online classes are also supplemented by Application Classes, where students practise hundreds of questions, especially the ones which have appeared in real exams.",
  },
{
  question: "How do I enroll at TathaGat?",
  answer: (
    <span className="text-base leading-relaxed">
      Choose the{" "}
      <a
        href="/course-purchase"
        className="px-1.5 py-0.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
      >
        package
      </a>{" "}
      that suits your needs and make the payment. You can select the{" "}
      <a
        href="/course-purchase"
        className="px-1.5 py-0.5 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition"
      >
        package here
      </a>. If you need any help,{" "}
      <a
        href="tel:920555534439"
        className="text-blue-400 font-medium underline hover:text-blue-600"
      >
        call us on 920555534439
      </a>.
    </span>
  ),
}

,
  {
    question: "Can I access recorded lectures of live classes?",
    answer:
     "Yes, once you are enrolled, you can access all the recorded lectures. All our live classes are recorded.",
  },
];

const FAQ = () => {
      const [openIndex, setOpenIndex] = useState(0);
     const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div>

          <section className="tsp-faq-section">
        <div className="tsp-faq-left">
          <h5> FAQS</h5>
          <h2>Your Questions</h2>
          <h2>Answered Clearly and</h2>
          <h2>Concisely</h2>
          <p>
            Find answers to common queries about TathaGat’s courses, teaching
            methods, tests, workshops, mentorship, fees, and more in our FAQs.
          </p>
          <button>Ask your question here</button>
        </div>

        <div className="tsp-faq-right">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`tsp-faq-item ${openIndex === index ? "open" : ""}`}
              onClick={() => toggleIndex(index)}
            >
              <div className="tsp-faq-question">
                <span>
                  {index + 1}. {faq.question}
                </span>
                <span className="tsp-faq-toggle">
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <p className="tg-faq-answer">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>
      
    </div>
  )
}

export default FAQ
