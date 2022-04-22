import fetch from 'node-fetch';

export default async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
     await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'post',
        body: JSON.stringify({
            text: 'Test'
        }),
        headers: {'Content-Type': 'application/json'}
    });
};
