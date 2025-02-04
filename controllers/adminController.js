const fs = require('fs')

const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/create', { categories })
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_message', data['message'])
        return res.redirect('back')
      }
      req.flash('success_message', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          return res.render('admin/create', {
            categories, restaurant: restaurant.toJSON()
          })
        })
    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_message', data['message'])
        return res.redirect('back')
      }
      req.flash('success_message', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
      })
      .then(() => {
        res.redirect('/admin/restaurants')
      })
  },

  getUsers: (req, res) => {
    adminController.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        user.isAdmin = !user.isAdmin  //將點選到的使用者切換全縣狀態
        const userState = user.isAdmin ? 'admin' : 'user' //使用者狀態
        req.flash('success_message', `成功將${user.name}使用者更改為${userState}`)
        //顯示成功修改權限狀態訊息
        user.update({ isAdmin: user.isAdmin })
        return res.redirect('/admin/users')
      })
  }
}

module.exports = adminController