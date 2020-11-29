
const _ = require('lodash')
const SERVER = `https://raw.githubusercontent.com/philipperemy/name-dataset/master/names_dataset/first_names.all.txt`

function updateFromServer(URL) {
    console.log('updateFromServer: init')
    let userNames = fetch(URL)
        .then(resp => resp.text())
        .then(txt => txt.split('\n'))
        .then(lst => lst.filter(txt => txt !== '--------------------'))
    console.log('updateFromServer: end')
    return userNames
}

export default class PureObject {

  async loadDictionary() {
    this.users = await updateFromServer(SERVER)
  }

  search(query) {
    return this.users.filter(user => user.includes(query)).map(name => Object.assign({}, {name}))
  }

}
