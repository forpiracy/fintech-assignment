const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set('views', './views');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Helper function to query Hasura 
async function hasuraQuery(query, variables) {
    const fetch = await import('node-fetch').then(module => module.default);
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET 
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    return result;
}

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    // console.log(token);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
}


// Home Page
const isSigned = false;
app.get('/', async (req, res) => {
    res.render('home');
}); 

//Sign In page
app.get('/signin', async (req, res) => {
    const found = false;
    const invalid = false;
    res.render('signIn', {found, invalid});
}); 

// Sign Up page
app.get('/signup', async (req, res) => {
    const exist = false;
    res.render('signUp', {exist});
}); 

 
// Sign Up - Adding entry to user table
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(name, email, password)

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
    mutation ($name: String!, $email: String!, $password: String!) {
        insert_users_one(object: {name: $name, email: $email, password: $password}) {
            user_id
            name
            email
        }
    }`;

    try{
        const variables = { name, email, password: hashedPassword };
        const data = await hasuraQuery(query, variables);
        if(data.errors){
            const exist = true;        
            return res.render('signUp', {exist})
        }
        res.redirect('/signin')
    }
    catch(error){
        console.log(error)
    }
});

// Sign In - Authenticating for the user
app.post('/signin', async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    const query = `
    query ($email: String!) {
        users(where: {email: {_eq: $email}}) {
            user_id
            name
            email
            password
        }
    }`;

    try{
        const variables = { email };
        const data = await hasuraQuery(query, variables);
    
        if (data.data.users.length === 0) {
            // const found = true;
            // const invalid = false;
            return res.status(400).json({ error: "User Not Found" });
        }
        
        const user = data.data.users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            // const found = false;
            // const invalid = true;
            return res.status(400).json({ error: "Invalid Password" });
        }
    
        const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.status(200).json({token: token, user_id: user.user_id});
    }catch(error){
        console.log(error);
    }
});

// Get User Accounts
app.post('/accounts', async (req, res) => {
    const token = req.body.token; 
    var user_id = 0;  
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        user_id = user.user_id;
    });
    console.log(user_id);

    const query = `
    query ($user_id: Int!) {
        accounts(where: {user_id: {_eq: $user_id}}) {
            account_id
            account_name
            balance
        }
    }`;

    const variables = { user_id };
    const data = await hasuraQuery(query, variables);

    console.log(data.data);
    res.render('user', {accounts: data.data.accounts});
});

// Create Account - Add entry of new account to the current user
app.post('/create-account', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    const account_name = req.body.account_name;
    const query = `
    mutation ($user_id: Int!, $account_name: String!) {
        insert_accounts_one(object: {user_id: $user_id, account_name: $account_name}) {
            user_id
            account_id
            account_name
            balance
        }
    }`;

    try{
        const variables = { user_id, account_name };
        const data = await hasuraQuery(query, variables);

        if(data.errors){
            // console.log(data.errors[0].message)
            return res.status(400).json({error: `Account '${account_name}' already exists`});
        }
        res.status(200).json({message: "success"});
    }catch(error){
        res.json(error);
        console.log(error); 
    }
});

// Delete Account
app.post('/delete-account', authenticateToken, async (req, res) => {
    const{ accountId }= req.body;
    console.log(accountId);
    const query = `
        mutation ($account_id: Int!) {
            delete_accounts_by_pk(account_id: $account_id) {
                account_id
            }
        }
    `;

    const variables = {account_id: accountId};
    try {
        const data = await hasuraQuery(query, variables);

        if(data.errors){
            return res.status(400).json({error: "Something went wrong"});
        }
        res.status(200).json({ message: 'Account deleted successfully', account_id: data.data.delete_accounts_by_pk.account_id });
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
    
});

// 6. Deposit money
app.post('/deposit', authenticateToken, async (req, res) => {
    const {amount, accountId} = req.body;
    console.log(amount, accountId);
    // const account_id = parseInt(req.params.id);
    // const amount = parseInt(req.query.amount);

    const query = `
        mutation ($account_id: Int!, $amount: numeric!) {
            update_accounts_by_pk(pk_columns: {account_id: $account_id}, _inc: {balance: $amount}) {
                account_id
                account_name
                balance
            }
        }
    `;

    try {
        const variables = {account_id: accountId, amount};
        const data = await hasuraQuery(query, variables);

        if(data.errors){
            return res.status(400).json({error: "Something went wrong"});
        }
        res.status(200).json({message: "success"});
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
});


// 7. Withdraw money
app.post('/withdraw', authenticateToken, async (req, res) => {
    const {amount, accountId} = req.body;
    console.log(amount, accountId);

    // Ensure the amount is positive and check for sufficient funds
    const checkBalanceQuery = `
        query ($account_id: Int!) {
            accounts_by_pk(account_id: $account_id) {
                balance
            }
        }
    `;

    try {
        const accountData = await hasuraQuery(checkBalanceQuery, {account_id: accountId});
        const currentAmount = accountData.data.accounts_by_pk.balance
        if (currentAmount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const query = `
            mutation ($account_id: Int!, $finalAmount: numeric!) {
                update_accounts_by_pk(pk_columns: {account_id: $account_id}, _set: {balance: $finalAmount}) {
                    account_id
                    account_name
                    balance
                }
            }
        `;

        const finalAmount = currentAmount-amount;
        const data = await hasuraQuery(query, { account_id: accountId, finalAmount });
        if(data.errors){
            return res.status(400).json({error: "Something went wrong"});
        }
        res.status(200).json({message: "success"});
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(error);
    }
});

app.listen(3000)