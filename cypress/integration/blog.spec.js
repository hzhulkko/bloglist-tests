describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/test/init')
  })

  describe('Login', function() {

    beforeEach(function() {
      cy.visit('http://localhost:3000')
    })

    it('succeeds with correct credentials', function() {
      cy.contains('Login')
      cy.get('#username').type('root')
      cy.get('#password').type('secret')
      cy.contains('login').click()
      cy.contains('Logged in as Superuser')
    })

    it('fails with incorrect credentials and error iis displayed', function() {
      cy.contains('Login')
      cy.get('#username').type('testuser')
      cy.get('#password').type('password')
      cy.contains('login').click()
      cy.get('.error').contains('invalid username or password')
    })
  })

  describe('When logged in', function() {

    beforeEach(function() {
      cy.login({username: 'root', password: 'secret'})
    })

    it('all blogs are listed in descending order by likes', function() {
      cy.get('#blog-list').find('.blog').should('have.length', 6)
      cy.get('#blog-list').find('.blog')
        .each(function() {
          cy.contains('view').click()
        })
      cy.get('#blog-list').find('.likes')
        .each(function(el, index) {
          const expectedLikesOrder = ['5', '4', '3', '2', '1', '0']
          const num = el.text().match('\\d+')[0]
          expect(num).to.eq(expectedLikesOrder[index])
        })
    })

    it('user can view blog details', function() {
      cy.contains('Title 1').contains('view').click()
      cy.get('.blog').contains('Title 1').parent().contains('likes: 1')
      cy.get('.blog').contains('Title 1').parent().contains('url: http://some.url')
      cy.get('.blog').contains('Title 1').parent().contains('user: Test User')
    })

    it('user can add a new blog', function() {
      cy.contains('add new blog').click()
      cy.get('#title').type('New Blog')
      cy.get('#author').type('Some Author')
      cy.get('#url').type('http://some.test.url')
      cy.get('#add-button').click()
      cy.get('#blog-list').find('.blog').should('have.length', 7)
      cy.get('#blog-list').contains('New Blog by Some Author')
    })

    it('user can remove their blog', function() {
      cy.contains('Title 2').contains('view').click()
      cy.get('.blog').contains('Title 2').parent().contains('remove').click()
      cy.get('.blog').should('not.contain', 'Title 2')
    })

    it('user cannot remove another users blog', function() {
      cy.contains('Title 1').contains('view').click()
      cy.get('.blog').contains('Title 1').parent().should('not.contain', 'remove')
    })

    it('user can like a blog', function() {
      cy.contains('Title 1').contains('view').click()
      cy.get('.blog').contains('Title 1').parent().contains('likes: 1')
      cy.get('.blog').contains('Title 1').parent().contains('like').click()
      cy.get('.blog').contains('Title 1').parent().contains('likes: 2')
    })
  })



})