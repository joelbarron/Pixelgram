export default {
  getImage () {
    return {
      id: '110ec58a-a0f2-4ac4-8393-c866d813b8d1',
      publicId: '4Dqc8lvbUtF3tYOacLqZBx8W3h1RG1hD38W8tXcQXdnX1nWGOn',
      userId: 'pixelgram',
      liked: false,
      likes: 0,
      src: 'something url',
      description: '#awesome',
      tags: [ 'awesome' ],
      createdAt: new Date().toString()
    }
  },
  getImages () {
    return [
      this.getImage(),
      this.getImage(),
      this.getImage()
    ]
  },
  getImagesByTag () {
    return [
      this.getImage(),
      this.getImage()
    ]
  },
  getUser () {
    return {
      id: '110ec58a-a0f2-4ac4-8393-c866d813b8d1',
      name: 'joel barron',
      username: 'jbarron',
      email: 'joel@pixelgram.com',
      password: 'jb123',
      createdAt: new Date().toString()
    }
  }
}
