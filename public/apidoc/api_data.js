define({ "api": [
  {
    "type": "post",
    "url": "/user/authenticate",
    "title": "Register new user or authenticate an existing user.",
    "description": "<p>To register a new user or to authenticate an existing user. This user will be a super admin to the App.</p>",
    "name": "authenticate",
    "group": "User",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "full_name",
            "description": "<p>Full name of user, used for registering the user via email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address, required while signing up/loggin in via email and password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password, required while signing up/loggin in via email and password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "auth_code",
            "description": "<p>Social login access token Google or FB.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"fb\"",
              "\"google\""
            ],
            "optional": false,
            "field": "source",
            "description": "<p>Social login source.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>success.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "response_code",
            "description": "<ol start=\"200\"> <li></li> </ol>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "response_message",
            "description": "<p>Empty or error message.</p>"
          }
        ]
      }
    },
    "filename": "../lc-dashboard/app/userRoutes.js",
    "groupTitle": "User"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "../lc-dashboard/public/apidoc/main.js",
    "group": "_home_tarun_officeP_lc_dashboard_public_apidoc_main_js",
    "groupTitle": "_home_tarun_officeP_lc_dashboard_public_apidoc_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "../lc-dashboard/views/apidoc/main.js",
    "group": "_home_tarun_officeP_lc_dashboard_views_apidoc_main_js",
    "groupTitle": "_home_tarun_officeP_lc_dashboard_views_apidoc_main_js",
    "name": ""
  }
] });
