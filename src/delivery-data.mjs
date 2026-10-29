// Marketing journeys: the deliverables and support are agreed for each purchase.
export const journeys = {
  custom: {
    label: 'Custom projects',
    stages: [
      {
        label: 'Discover', eyebrow: '01 / DISCOVERY & DIRECTION', title: 'A clear beginning. A shared vision.',
        description: 'Tell us what you want to build. Together, we shape the scope, priorities and a practical route forward.',
        checks: ['Your goals and workflow', 'A scope we agree together', 'Milestones and an estimate'],
        action: 'Explore the project brief', packTitle: 'Your project blueprint', badge: 'Clarity from the beginning',
        items: [
          { title: 'Project brief', detail: 'Your business goals, intended users and the problem the project should solve.' },
          { title: 'Scope & milestones', detail: 'The agreed features, responsibilities, review points and proposed delivery schedule.' },
          { title: 'Project proposal', detail: 'An estimate and a clear record of what is included, before development begins.' }
        ]
      },
      {
        label: 'Design & build', eyebrow: '02 / DESIGN & DEVELOPMENT', title: 'Your idea, taking shape.',
        description: 'Explore the design, review progress and refine the details as your software, ERP or digital experience comes together.',
        checks: ['Design reviews with you', 'Development against the agreed scope', 'Testing and feedback checkpoints'],
        action: 'Explore the build process', packTitle: 'Your progress, in view', badge: 'Built around your feedback',
        items: [
          { title: 'Design direction', detail: 'Layouts and interaction concepts for review, with the design deliverables defined in your proposal.' },
          { title: 'Build previews', detail: 'Working previews at the agreed milestones so you can review the experience as it develops.' },
          { title: 'Review notes', detail: 'A shared record of feedback, testing findings and approved changes to keep the project focused.' }
        ]
      },
      {
        label: 'Launch', eyebrow: '03 / LAUNCH & HANDOVER', title: 'Ready for your next chapter.',
        description: 'Review the agreed deliverables, get familiar with your workspace, and plan a confident launch.',
        checks: ['Project walkthrough', 'Access and documentation', 'Your next steps, explained'],
        action: 'Explore the handover', packTitle: 'Your launch pack', badge: 'A thoughtful handover',
        items: [
          { title: 'Project files', detail: 'The files, deployment access or design assets included in your agreement, with ownership and licensing explained.' },
          { title: 'Getting-started guide', detail: 'A walkthrough and the agreed documentation to help you use and manage your new solution.' },
          { title: 'Support plan', detail: 'Your agreed support channels, coverage, maintenance arrangements and how to request further work.' }
        ]
      },
      {
        label: 'Support & evolve', eyebrow: '04 / SUPPORT & EVOLUTION', title: 'A launch is just the beginning.',
        description: 'Plan the care your solution needs, from questions and maintenance to the next feature on your roadmap.',
        checks: ['A clear way to request help', 'Maintenance matched to your needs', 'New ideas, scoped together'],
        action: 'Explore ongoing support', packTitle: 'Your next possibilities', badge: 'Room to grow, together',
        items: [
          { title: 'Support guide', detail: 'How to describe an issue, share relevant details securely and contact us through the agreed support channel.' },
          { title: 'Care plan', detail: 'Updates, maintenance and any response targets are defined in your selected support agreement.' },
          { title: 'Future roadmap', detail: 'Discuss improvements and new integrations. Additional work is scoped and quoted before it begins.' }
        ]
      }
    ]
  },
  ready: {
    label: 'Ready-made products',
    stages: [
      {
        label: 'Find your fit', eyebrow: '01 / EXPLORE & COMPARE', title: 'The right tool for your next move.',
        description: 'Explore software, UI kits and chatbot solutions. Compare what is included and choose the fit for your business.',
        checks: ['Explore features and previews', 'Check requirements and compatibility', 'Review the product licence'],
        action: 'Explore what to look for', packTitle: 'Your product shortlist', badge: 'Find a fit before you commit',
        items: [
          { title: 'Product overview', detail: 'A summary of the features, intended users and the files or access included in the product.' },
          { title: 'Preview & requirements', detail: 'Review an available preview and check supported devices, platforms, dependencies and setup requirements.' },
          { title: 'Licence details', detail: 'Check permitted use, project or user limits, renewal terms and whether customisation is included.' }
        ]
      },
      {
        label: 'Review & choose', eyebrow: '02 / DETAILS & YOUR DECISION', title: 'Know what comes with your choice.',
        description: 'Confirm the price, licence and delivery method before ordering. Ask us if you need help choosing a solution.',
        checks: ['Price and billing terms', 'Included files or account access', 'Delivery and support details'],
        action: 'Explore the order details', packTitle: 'Your purchase checklist', badge: 'Clear expectations, from the start',
        items: [
          { title: 'Price & licence', detail: 'Review one-time or recurring charges, the licence and any services billed separately.' },
          { title: 'Delivery details', detail: 'Check how and when access or files are provided. Availability and delivery vary by product.' },
          { title: 'Included support', detail: 'Confirm the support period, update eligibility and any product-specific terms before ordering.' }
        ]
      },
      {
        label: 'Access & setup', eyebrow: '03 / DELIVERY & GETTING STARTED', title: 'From choosing to making it yours.',
        description: 'Receive the files or access included with your product and follow its setup guidance to get started.',
        checks: ['Your product delivery', 'Installation or account guidance', 'A clear route to setup help'],
        action: 'Explore the delivery pack', packTitle: 'Your getting-started pack', badge: 'A considered first step',
        items: [
          { title: 'Files or access', detail: 'Depending on the product, delivery may include downloadable assets, licence details or account access.' },
          { title: 'Setup guidance', detail: 'Follow the product documentation. Any assisted installation or onboarding is agreed separately unless included.' },
          { title: 'Product resources', detail: 'Refer to the available guides, product information and support details supplied with your solution.' }
        ]
      },
      {
        label: 'Help & updates', eyebrow: '04 / PRODUCT CARE', title: 'Keep your next chapter moving.',
        description: 'Use the support included with your product, explore eligible updates and discuss customisation when your needs grow.',
        checks: ['Product-specific help', 'Updates under your licence', 'Options for tailored improvements'],
        action: 'Explore product support', packTitle: 'Your product care guide', badge: 'Support that fits your solution',
        items: [
          { title: 'Help resources', detail: 'Start with the product guidance and use the listed contact route for questions within your support coverage.' },
          { title: 'Update information', detail: 'Update access, version compatibility and renewals depend on the product and licence you choose.' },
          { title: 'Customisation options', detail: 'If you need a different workflow or integration, discuss a separate custom project with us.' }
        ]
      }
    ]
  }
};

export function createDeliveryState() { return { journey: 'custom', steps: { custom: 2, ready: 0 } }; }
export function selectDeliveryJourney(state, journey) {
  return Object.hasOwn(journeys, journey) ? { ...state, journey } : state;
}
export function selectDeliveryStep(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= journeys[state.journey].stages.length) return state;
  return { ...state, steps: { ...state.steps, [state.journey]: index } };
}
export function deliveryStepForKey(index, key, count) {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowLeft') return (index - 1 + count) % count;
  return null;
}
