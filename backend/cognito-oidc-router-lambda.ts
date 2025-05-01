import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({});

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const email = body.email;

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Valid email is required' })
      };
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        email: { S: email }
      }
    };

    const command = new GetItemCommand(params);
    const response = await ddb.send(command);

    if (response.Item) {
      const result = {
        issuer: response.Item.issuer.S,
        client_id: response.Item.client_id.S,
        redirect_uri: response.Item.redirect_uri.S,
        scopes: response.Item.scopes?.S || 'openid profile email',
        idp_identifier: response.Item.idp_identifier?.S
      };

      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
    }

    // Fallback to default IdP
    const fallback = {
      issuer: process.env.DEFAULT_ISSUER,
      client_id: process.env.DEFAULT_CLIENT_ID,
      redirect_uri: process.env.DEFAULT_REDIRECT_URI,
      scopes: process.env.DEFAULT_SCOPES || 'openid profile email'
    };

    return {
      statusCode: 200,
      body: JSON.stringify(fallback)
    };

  } catch (err) {
    console.error('Lookup IdP error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};