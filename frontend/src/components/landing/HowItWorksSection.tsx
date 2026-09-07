const steps = [
  {
    num: '01',
    title: 'Upload',
    desc: 'Upload a scanned land document.',
  },
  {
    num: '02',
    title: 'Detect',
    desc: 'AI identifies tables, signatures and stamps.',
  },
  {
    num: '03',
    title: 'Review',
    desc: 'Detected evidence is presented for assisted verification.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="hiw__inner">
        <p className="hiw__eyebrow">How It Works</p>
        <h2 className="hiw__heading">
          Three steps to <strong>verified records</strong>
        </h2>

        <div className="hiw__steps">
          {steps.map((step) => (
            <div key={step.num} className="hiw__step">
              <div className="hiw__step-num">{step.num}</div>
              <div className="hiw__step-divider" />
              <h3 className="hiw__step-title">{step.title}</h3>
              <p className="hiw__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
