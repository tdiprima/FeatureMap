

let x = new Promise((resolve, reject) => {
  return fetch(url).then(response => {
    if (response.ok) {
      resolve(response)
    } else {
      reject(new Error('error'))
    }
  }, error => {
    reject(new Error(error.message))
  })
});