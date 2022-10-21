//TEAM BRAZIL
const axiosLib = require("axios");
const BASE_URL = "http://localhost:3000";
const DEFAULT_VARIABLE = "default";

async function main(user, conversation, prompt) {
    const extractedVariables = extractVariables(prompt);

    const variables = mountVariables(extractedVariables);

    if (variables.length == 0) {
        return prompt;
    }

    const responses = await getVariablesValues(user, conversation, variables);

    const newPrompt = mountPhraseToGptResponse(responses, extractedVariables, prompt);

    return newPrompt;
}

function extractVariables(prompt) {
    const regex = '£{(.*?)}';
    const r = new RegExp(regex, 'g');
    const array = [...prompt.matchAll(r)];

    return array;
}

function mountVariables(extractedVariables) {
    let variables = [];
    for (let variable of extractedVariables) {
        variables.push(variable[1]);
    }

    return variables;
}

async function getVariablesValues(user, conversation, variables, req = request) {
    let responses = [];
    for (let variable of variables) {
        const url = mountUrl(user, conversation, variable);
        const response = await req(url, "GET");
        responses.push(response);
    }

    return responses;
}


function mountUrl(user, conversation, name) {
    return BASE_URL.concat(`/api/variables/${user}/${conversation}/${name}`);
}

async function request(url, method, body = undefined, axios = axiosLib) {
    const option = {
        url: url,
        method: method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: JSON.stringify(body)
    };

    try {
        const result = await axios(option);
        return result.data.value;

    } catch (error) {
        return DEFAULT_VARIABLE;
    }
}

function mountPhraseToGptResponse(responses, extractedVariables, prompt) {
    let variables = [];
    for (let variable of extractedVariables) {
        variables.push(variable[0]);
    }

    let i = 0;
    for (let variable of variables) {
        prompt = prompt.replace(variable, responses[i]);
        i++;
    }

    return prompt;
}

module.exports = {
    extractVariables,
    mountVariables,
    getVariablesValues,
    request,
    mountUrl,
    mountPhraseToGptResponse,
    main
}
//TEAM BRAZIL