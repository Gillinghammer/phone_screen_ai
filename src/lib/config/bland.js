export const GLOBAL_PROMPT = `If the user needs more time you should only reply with "mhmm," "uh huh," "sure," or "alrighty." When the user is talking backchannel with  "mhmm," "uh huh," "sure," or "alrighty." Make sure you are super short in your replies when you're chit chatting with the user. You also should use this if the user is expressing a partial thought, usually this is the case if they've only said 1-2 words or their sentence ends in "uh" or a similar unclear verbal tick. We want to make sure that if we don't have the full thought from the user, that we use one of the backchannels to encourage them to keep talking.`;

export const MODEL_OPTIONS = {
  default: {
    modelType: "Bland Beta",
    temperature: 0
  },
  smart: {
    modelType: "smart",
    temperature: 0,
    skipUserResponse: false,
    block_interruptions: false,
    interruptionThreshold: 200
  }
};

export const NODE_CONFIGS = {
  start: {
    id: "start",
    type: "Default",
    data: {
      name: "Start",
      text: "Hi there! This is Ashley calling from the recruiting team. I'm calling to conduct your phone screen interview today. Is now still a good time?",
      isStart: true,
      globalPrompt: GLOBAL_PROMPT,
      modelOptions: MODEL_OPTIONS.default
    }
  },
  ready: (jobTitle) => ({
    id: "ready_to_begin",
    type: "Default",
    data: {
      name: "Ready to begin",
      text: `Ok great, and to confirm you are ready to begin the phone screen for the ${jobTitle} position?`,
      active: false,
      condition: "The condition is achieved if the user confirms yes, or they are ready to begin",
      globalPrompt: GLOBAL_PROMPT,
      modelOptions: MODEL_OPTIONS.default
    }
  }),
  question: (question, index) => ({
    id: `question_${index + 1}`,
    type: "Default",
    data: {
      name: `Question ${index + 1}`,
      prompt:`Ask the candidate the question: ${question}`,
      isStart: false,
      isGlobal: false,
      condition: "The candidate has finished answering the question, even if they didn't provide the answer you were looking for.",
      extractVars: [["answer", "string", "The candidate's answer to the question"]],
      globalPrompt: GLOBAL_PROMPT,
      modelOptions: MODEL_OPTIONS.smart
    }
  }),
  end: {
    id: "end",
    type: "End Call",
    data: {
      name: "End Call",
      prompt: "Thank the candidate for their time and let them know that someone from the recruiting team will be in touch with next steps. Then say goodbye.",
      globalPrompt: GLOBAL_PROMPT
    }
  }
};

export const createEdges = (nodes) => {
  const { startNode, readyNode, questionNodes, endNode } = nodes;
  
  return [
    { 
      id: "edge-start-ready", 
      label: "User responds", 
      source: startNode.id, 
      target: readyNode.id 
    },
    { 
      id: "edge-ready-first-question", 
      label: "User confirms ready to begin", 
      source: readyNode.id, 
      target: questionNodes[0].id 
    },
    ...questionNodes.slice(0, -1).map((node, index) => ({
      id: `edge-question-${index + 1}`,
      label: "Candidate answered the interview question",
      source: node.id,
      target: questionNodes[index + 1].id
    })),
    { 
      id: "edge-lastquestion-end", 
      label: "Candidate answered the interview question", 
      source: questionNodes[questionNodes.length - 1].id, 
      target: endNode.id 
    }
  ];
};
