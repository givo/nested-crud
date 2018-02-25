import { expect } from 'chai';
import * as express from 'express';
import {UsersManager} from './UsersManager';
import { Cruder } from '../src/index';
import { User } from './User';
import * as http from 'http';
import * as assert from 'assert';

let app = express();
let cruder = new Cruder();
let usersManager = new UsersManager();

usersManager.create(new User("Yosi", 174));
usersManager.create(new User("Beni", 165));
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

let allUsers: any[];

describe("REST Collections", () => {
    before(async () => {     
        allUsers = await usersManager.readMany();
        
        cruder.parentCollection('/users', usersManager);

        let usersREST = cruder.listen('/users/:userId');

        app.use(usersREST);

        app.listen(3000);
    });
    
    describe(("/users"), () => {
        it('should return all users', function(done) {
            this.timeout(10000);

            http.get('http://127.0.0.1:3000/', (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) =>{
                    body += data;
                });

                res.on('end', () => {
                    try{
                        let users = JSON.parse(body);

                        expect(users).to.equal(allUsers);
                    }
                    catch(err){
                        assert.fail(err);
                    }
                });
            });
        });
    });
});