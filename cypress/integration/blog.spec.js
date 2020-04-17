describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/test/init')
  })

  describe('When not logged in', function() {
    beforeEach(function() {
      cy.visit('http://localhost:3000')
    })

    it('navigation bar is visible but content is not dispalyed', function() {
      cy.contains('users').click()
      cy.url().should('include', '/users')
      cy.get('.root').should('not.contain', 'Users')
      cy.contains('blogs').click()
      cy.get('.root').should('not.contain', 'Blogs')
    })

    describe('login', function() {

      it('succeeds with correct credentials', function() {
        cy.contains('Login')
        cy.get('#username').type('root')
        cy.get('#password').type('secret')
        cy.contains('login').click()
        cy.contains('Logged in as Superuser')
      })

      it('fails with incorrect credentials and error is displayed', function() {
        cy.contains('Login')
        cy.get('#username').type('testuser')
        cy.get('#password').type('password')
        cy.contains('login').click()
        cy.get('.error').contains('invalid username or password')
      })
    })

  })



  describe('When logged in', function() {

    beforeEach(function() {
      cy.login({username: 'root', password: 'secret'})
    })

    describe('in the front page', function() {

      it('all blogs are listed in descending order by likes', function() {
        cy.get('#blog-list').find('a').should('have.length', 6)
        cy.get('#blog-list').find('a')
          .each(function(el, index) {
            const expectedTitleOrder = ['5', '4', '3', '2', '1', '6']
            const num = el.text().match('\\d+')[0]
            expect(num).to.eq(expectedTitleOrder[index])
          })
      })

      it('user can view blog details in blog page by clicking the link', function() {
        cy.contains('Title 1').click()
        cy.get('.blog').contains('Title 1').parent().contains('likes: 1')
        cy.get('.blog').contains('Title 1').parent().contains('url: http://some.url')
        cy.get('.blog').contains('Title 1').parent().contains('user: Test User')
        cy.url().should('match', /blogs\/[a-z0-9]{24,}/)
      })

      it('user can add a new blog', function() {
        cy.contains('add new blog').click()
        cy.get('#title').type('New Blog')
        cy.get('#author').type('Some Author')
        cy.get('#url').type('http://some.test.url')
        cy.get('#add-button').click()
        cy.get('#blog-list').find('a').should('have.length', 7)
        cy.get('#blog-list').contains('New Blog by Some Author')
      })

      it('user can remove their blog', function() {
        cy.contains('Title 2').click()
        cy.get('.blog').contains('Title 2').parent().contains('remove').click()
        cy.url().should('be', 'http://localhost:3000/')
        cy.get('#blog-list').should('not.contain', 'Title 2')
      })

      it('user cannot remove another users blog', function() {
        cy.contains('Title 1').click()
        cy.get('.blog').contains('Title 1').parent().should('not.contain', 'remove')
      })

      it('user can like a blog', function() {
        cy.contains('Title 1').click()
        cy.get('.blog').contains('Title 1').parent().contains('likes: 1')
        cy.get('.blog').contains('Title 1').parent().contains('like').click()
        cy.get('.blog').contains('Title 1').parent().contains('likes: 2')
      })

    })

    describe('in the users page', function() {

      beforeEach(function() {
        cy.visit('http://localhost:3000/users')
      })

      it('all users and number of blogs they have created are shown', function() {
        cy.get('#user-list').find('tbody tr').should('have.length', 3)
        cy.get('#user-list').contains('Superuser').parent().siblings().contains(3)
        cy.get('#user-list').contains('Test User').parent().siblings().contains(3)
        cy.get('#user-list').contains('Login User').parent().siblings().contains(0)
      })

      it('clicking on a name shows blogs added by the user', function() {
        cy.contains('Test User').click()
        cy.get('h3').contains('Test User')
        cy.get('#user-blog-list').find('a').should('have.length', 3)
        cy.get('#user-blog-list').find('a').contains('Title 1')
        cy.get('#user-blog-list').find('a').contains('Title 3')
        cy.get('#user-blog-list').find('a').contains('Title 5')
      })

      it('if the user has not added blogs, message is displayed', function() {
        cy.contains('Login User').click()
        cy.get('h3').contains('Login User')
        cy.contains('No blogs added')
      })

    })


  })

})