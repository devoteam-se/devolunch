import fetch from 'node-fetch';

export default async () => {
     await fetch('https://hooks.slack.com/services/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', {
        method: 'post',
        body: JSON.stringify({
            text: 'Test'
        }),
        headers: {'Content-Type': 'application/json'}
    });
};