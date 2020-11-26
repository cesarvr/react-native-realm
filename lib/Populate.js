let Realm = require('realm')
const bson = require('bson')
const _ = require('lodash')

const SERVER = `https://raw.githubusercontent.com/philipperemy/name-dataset/master/names_dataset/first_names.all.txt`

const PersonSchema = {
    name: 'Dictionary',
    properties: {
        name: 'string',
        status: 'bool',
        _id: 'objectId',
    },
    primaryKey: '_id'   // Another change... the impact is higher if you already set a primaryKey.
}

function deleteAll(realm) {
    console.log('deleting db')
    realm.write(() => {
        realm.deleteAll()
    })
    console.log('deleting ok')
}


const startDB = async () => {
    console.log('startDB [init]')

    const appConfig = {
        id: `test-2-gwgbf`,
        timeout: 10000,
        app: {
            name: 'test-2',
            version: '0',
        },
    }

    let CFG =  {
        schema: [PersonSchema],
        sync: {
            user: undefined,
            partitionValue: `name`,
        },
    }

    try{
        let app = new Realm.App(appConfig)

        Realm.App.Sync.setLogLevel(app,'all')
        Realm.App.Sync.setLogger(app, (lvl, msg) =>
            console.log(`[logs]  ${lvl} -> ${msg}` ))

        const creds = Realm.Credentials
        let anonymous = creds.anonymous()
        const newUser = await app.logIn(anonymous);
        CFG.sync.user = newUser

        console.log('realm open')
        let realm = await Realm.open(CFG)  // How to make it non-blocking...
        console.log('realm open [ok]')

        deleteAll(realm)

        console.log('startDB [end]')
        return realm
    }catch(error){
        console.log('Fatal: ', error)
    }


    console.log('startDB [end]')
    return undefined
}

class Timing {
    start() {
        this.start = new Date().getTime()
    }

    end() {
        this.end = new Date().getTime() - this.start
        console.log('Time Lapse: ', this.end, 'ms')
    }
}

let T = new Timing()

function updateFromServer(URL){
    console.log('updateFromServer: init')
    let userNames = fetch(URL)
        .then(resp => resp.text())
        .then(txt => txt.split('\n'))
        .then(lst => lst.filter(txt => txt !=='--------------------'))
    console.log('updateFromServer: end')
    return userNames
}

function storeUsers(realm, names){
    console.log('storeUsers: init')

    if(!_.isEmpty(names)) {

        /* loading: 164433 registers */

        console.log(`loading: ${names.length} registers`)
        let startTime = new Date()

        realm.write(() => {
            names.forEach(name =>  // 9s  - 1.xx
                realm.create('Dictionary',{
                    name,
                    status: false,
                    _id: new bson.ObjectId()
                })
            )
        })

        let endTime = new Date()
        var timeDiff = endTime - startTime
        
        // current speed: time it took to store the data: 8s
        console.log(`time it took to store: ${Math.round(timeDiff /= 1000)}s`)
        

    }

    console.log('storeUsers: end')
}



async function Populate(realm){
    try{
        console.log('Populate: init')


        let dbSize = realm.objects('Dictionary').length
        let isEmpty = dbSize  === 0

        console.log('records:', dbSize)
        let persons;

        if( isEmpty ){
            persons = await updateFromServer(SERVER)
            storeUsers(realm, persons)
        }else
            console.log('There is one already...continue...')

        console.log('Populate: end')
        return persons

    }catch(error){
        console.log('Error: ', error)
    }

    console.log('Populate: end')
}

const Persons = async function() {
    console.log('Person [init]')

    let realm = await startDB()
    console.log('realm --> ', realm)

    if(realm === undefined)
        return [{key: 'Nothing'}]
    let populate = await Populate(realm)
    let peoples = []

    return function(query) {
        try{
            let realmQuery = `name BEGINSWITH "${query}"`
            list = realm.objects('Dictionary')

            if(!_.isEmpty(query) )
              list = list.filtered(realmQuery)

            return list
        }catch(error){
            console.log('Error: ', error)
        }
    }

    console.log('Person [end]')
    return [{key: 'Nothing'}]
}

export { Populate, Persons };
