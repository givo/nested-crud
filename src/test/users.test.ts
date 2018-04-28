import { expect } from 'chai';
import * as express from 'express';
import { Sailer } from '../index';
import { User } from './entities/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { ItemsManager } from '../helpers/ItemsManager';
import { getBody, request } from './helper';
import { UsersCollection } from './entities/UsersCollection';
import { POINT_CONVERSION_COMPRESSED } from 'constants';

let port = 3000;

let app = express();
let sailer = new Sailer();
let usersManager = new UsersCollection();

usersManager.create({ name: "Yosi", height: 174 });
usersManager.create({ name: "Beni", height: 165 });
usersManager.create({ name: "Shlomi", height: 188 });
usersManager.create({ name: "Shimon", height: 190 });

let allUsers: any[];
let server: http.Server;


describe("Users", () => {
    before(async () => {
        allUsers = await usersManager.readMany();
        allUsers = allUsers.map((user) => {
            return user.describe();
        });

        let usersREST = sailer.collection('/users/:userId', usersManager);
        app.use(usersREST);

        server = app.listen(port);
    });

    after(() => {
        server.close();
    });

    //
    // create /users
    //
    describe(("create /users"), () => {
        it('should create a new user with id 4', async function () {
            this.timeout(10000);

            let bodyString = JSON.stringify({
                name: 'Yoni',
                height: 500
            });

            let body = await request(`http://127.0.0.1/users`, port, 'POST', bodyString);

            let userId: string = JSON.parse(body).id;
            expect(userId).to.equal("4");
        });
    });

    //
    // get /users
    //
    describe(("get /users"), () => {
        it('should return all users', function (done) {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users`, async (res) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                
                expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(usersManager.describe()));
                done();
            });
        });
    });

    //
    // get /users/1
    //
    describe(("get /users/1"), () => {
        it('should return user with id: 1', function (done) {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1`, async (res) => {
                expect(res.statusCode).to.equal(200);

                let body: string = await getBody(res);
                
                let user1 = await usersManager.readById((1).toString());
                expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1.describe()));
                done();
            });
        });
    });

    //
    // update /users/1
    //
    describe(("put /users/1"), () => {
        it('should update user with id: 1', async function () {
            this.timeout(10000);

            let reqBody = {
                fields: {
                    height: 111
                }
            }

            let body = await request(`http://127.0.0.1/users/1`, port, 'PUT', JSON.stringify(reqBody));
                
            let user1 = <User>await usersManager.readById("1");
            expect(user1.height).to.equal(111);
        });
    });

    //
    // update all
    //
    describe(("put /users"), () => {
        it('should update all users', async function () {
            this.timeout(10000);

            let reqBody = JSON.stringify({
                fields: {
                    height: 300
                }
            });

            let body = await request(`http://127.0.0.1/users`, port, 'PUT', reqBody);
                
            let updatedUsers = JSON.parse(body).count;

            expect(updatedUsers, "Didn't update 5 users").to.equal(5);

            usersManager._items.forEach((user: User) => {
                expect(user.height, `User: \"${user.name}\" wasn't updated`).to.equal(300);
            });
        });
    });

    //
    // delete /users/2
    //
    describe(("delete /users/2"), () => {
        it('should delete users with id 2', async function () {
            this.timeout(10000);

            let options = {
                host: 'localhost',
                path: '/users/2',
                port: 3000,
                method: 'DELETE',
            };

            let user2: User = <User>(await usersManager.readById((2).toString()));

            let body = await request(`http://127.0.0.1/users/2`, port, 'DELETE');   

            let deletedItem: string = JSON.parse(body);

            expect(body, "Didn't delete item with id 2").to.equal(JSON.stringify(user2.describe()));
        });
    });

    //
    // delete all /users
    //
    describe(("delete /users"), () => {
        it('should delete all users', async function () {
            this.timeout(10000);

            let body = await request(`http://127.0.0.1/users`, port, 'DELETE'); 

            let deleted: string = JSON.parse(body).count;

            expect(deleted, "Didn't delete all items").to.equal(4);
        });
    });
});