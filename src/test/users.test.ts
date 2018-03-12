import { expect } from 'chai';
import * as express from 'express';
import { Cruder } from '../index';
import { User } from './foundations/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { ItemsManager } from '../helpers/ItemsManager';
import { getBody } from './helper';
import { UsersCollection } from './foundations/UsersCollection';

let app = express();
let cruder = new Cruder();
let usersManager = new UsersCollection();

usersManager.create(new User("Yosi", 174));
usersManager.create(new User("Beni", 165));
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

let allUsers: any[];
let server: http.Server;


describe("Users", () => {
    before(async () => {
        allUsers = await usersManager.readMany();
        allUsers = allUsers.map((user) => {
            return user.describe();
        });

        let usersREST = cruder.listen('/users/:userId', usersManager);
        app.use(usersREST);

        server = app.listen(3000);
    });

    after(() => {
        server.close();
    });

    //
    // get /users
    //
    describe(("get /users"), () => {
        it('should return all users', function (done) {
            this.timeout(10000);

            http.get('http://127.0.0.1:3000/users', async (res) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);

                expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(allUsers));
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

            http.get('http://127.0.0.1:3000/users/1', (res) => {
                expect(res.statusCode).to.equal(200);

                let body = '';
                res.on('data', (data) => {
                    body += data;
                });

                res.on('end', async () => {
                    let user1 = await usersManager.readById((1).toString());
                    expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1.describe()));
                    done();
                });
            });
        });
    });

    //
    // update /users/1
    //
    describe(("put /users/1"), () => {
        it('should update user with id: 1', async function () {
            this.timeout(10000);

            let user1Copy = new User("XXX", 111);
            user1Copy.id = "1";
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
                res.on('data', (data) => {
                    body += data;
                });

                res.on('end', () => {
                    expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(user1Copy.describe()));
                });
            }).write(bodyString);
        });
    });

    //
    // update all
    //
    describe(("put /users"), () => {
        it('should update user with id: 1', async function () {
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
                let updatedUsers = JSON.parse(body).count;

                expect(updatedUsers, "4 users were updated").to.equal(4);

                for (let i = 0; i < updatedUsers; i++) {
                    let user:User = <User> await usersManager.readById((i).toString());
                    expect(user.height, `User: \"${allUsers[i].name}\" wasn't updated`).to.equal(300);
                }
            }).write(bodyString);
        });
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

            let options = {
                host: 'localhost',
                path: '/users',
                port: 3000,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': bodyString.length
                }
            };

            http.request(options, async (res: http.IncomingMessage) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                let userId: string = JSON.parse(body).id;

                expect(userId, "Received a wrong user id").to.equal((4).toString());
            }).write(bodyString);
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

            http.request(options, async (res: http.IncomingMessage) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                let deletedItem: string = JSON.parse(body);

                expect(body, "Didn't delete item with id 2").to.equal(JSON.stringify(user2.describe()));
            }).end();
        });
    });

    //
    // delete all /users
    //
    describe(("delete /users"), () => {
        it('should delete all users', async function () {
            this.timeout(10000);

            let options = {
                host: 'localhost',
                path: '/users',
                port: 3000,
                method: 'DELETE',
            };

            http.request(options, async (res: http.IncomingMessage) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                let deleted: string = JSON.parse(body).count;

                expect(deleted, "Didn't delete all items").to.equal(4);
            }).end();
        });
    });
});