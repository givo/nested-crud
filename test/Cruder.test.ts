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
                    try{
                        expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(allUsers));
                        done();
                    }
                    catch(err){
                        console.log(12312);
                        assert.fail(err);
                    }
                });
            });
        });
    });

    //
    // get /users/1
    //
    describe(("/users/1"), () => {
        it('should return user with id: 1', function(done) {
            this.timeout(10000);

            http.get('http://127.0.0.1:3000/users/1', (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) =>{
                    body += data;
                });

                res.on('end', () => {
                    try{
                        let user1 = usersManager.readById((1).toString());
                        expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1));
                        done();
                    }
                    catch(err){
                        console.log(12312);
                        assert.fail(err);
                    }
                });
            });            
        });
    });
});