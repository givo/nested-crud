import { expect } from 'chai';
import * as express from 'express';
import {UsersManager} from './UsersManager';
import { Cruder } from '../src/index';
import { User } from './User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';

let app = express();
let cruder = new Cruder();
let usersManager = new UsersManager();

usersManager.create(new User("Yosi", 174));
usersManager.create(new User("Beni", 165));
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

let allUsers: any[];

describe("Curder - Collections", () => {
    before(async () => {
        allUsers = await usersManager.readMany();

        let usersREST = cruder.listen('/users/:userId', usersManager);
        app.use(usersREST);

        app.listen(3000);
    });
    
    //
    // get /users
    //
    describe(("/users"), () => {
        it('should return all users', function(done) {
            this.timeout(10000);

            http.get('http://127.0.0.1:3000/users', (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) =>{
                    body += data;
                });

                res.on('end', () => {
                    expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(allUsers));
                    done();
                });
            });
        });
    });

    //
    // get /users/1
    //
    describe(("get /users/1"), () => {
        it('should return user with id: 1', function(done) {
            this.timeout(10000);

            http.get('http://127.0.0.1:3000/users/1', (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) =>{
                    body += data;
                });

                res.on('end', async () => {
                    let user1 = await usersManager.readById((1).toString());
                    expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1));
                    done();
                });
            });            
        });
    });

    //
    // update /users/1
    //
    describe(("put /users/1"), () => {
        it('should update user with id: 1', async function() {
            this.timeout(10000);

            let user1 = await usersManager.readById((1).toString());
            let user1Copy = JSON.parse(JSON.stringify(user1));
            user1Copy.height = 200;
            let bodyString = JSON.stringify(user1Copy);

            let options = {
                host: 'localhost',
                path: '/users/1',
                port: 3000,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': bodyString.length
                }
            };

            http.request(options, (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) =>{
                    body += data;
                });

                res.on('end', () => {
                    expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1Copy));
                });
            }).write(bodyString);
        });
    });

    //
    // update all
    //
    describe(("put /users"), () => {
        it('should update user with id: 1', async function() {
            this.timeout(10000);

            let bodyString = JSON.stringify({
                height: 300
            });

            let options = {
                host: 'localhost',
                path: '/users',
                port: 3000,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': bodyString.length
                }
            };

            http.request(options, async (res: http.IncomingMessage) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                let updatedUsers = JSON.parse(body);

                for(let i = 0; i < updatedUsers.length; i++){
                    expect(updatedUsers[i], `Received unexpected user. received: ${updatedUsers}`).to.equal(JSON.stringify(allUsers[i]));
                }
            }).write(bodyString);
        });
    });
});

function getBody(res: http.IncomingMessage): Promise<string>{
    return new Promise((resolve, reject) => {
        let body = '';
    
        res.on('data', (data) =>{
            body += data;
        });
    
        res.on('end', () => {
            resolve(body);
        });
    });
}