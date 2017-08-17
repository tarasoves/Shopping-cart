from flask import Flask, render_template, redirect, url_for, json, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SubmitField, SelectMultipleField
from wtforms.validators import DataRequired
from flask_json import FlaskJSON, as_json


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///new.db'
app.config['SECRET_KEY'] = 'secret key'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

json = FlaskJSON(app)

def to_choices():
    choice = []
    for u in User.query.all():
        choice.append((u.name, u.name))
    if choice == []:
        choice.append(('Пустота', 'Пустота'))
    return choice

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    contact = db.Column(db.String(50))
    age = db.Column(db.Integer)
    house = db.relationship('House', backref='user', lazy='dynamic')

    def __init__(self, name, contact, age):
        self.name = name
        self.contact = contact
        self.age = age

    def to_json(self):
        json_user = {
            'id': self.id,
            'name': self.name,
            'contact': self.contact,
            'age': self.age,
            'house': [h.to_json() for h in House.query.filter_by(user_id=self.id)]
        }
        return json_user



class House(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    street = db.Column(db.String(100))
    dom = db.Column(db.Integer)
    kv = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order = db.relationship('OrderCount', backref='house', lazy='dynamic')

    def __init__(self, street, dom, kv, user_id):
        self.street = street
        self.dom = dom
        self.kv = kv
        self.user_id = user_id

    def to_json(self):
        json_house = {
            'street': self.street,
            'dom': self.dom,
            'kv': self.kv
        }
        return json_house


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50), default='create')
    date = db.Column(db.DateTime, default = None)
    order_count = db.relationship('OrderCount', backref='order', lazy='dynamic')

    # def __init__(self, status='create', date = None ):
    #     self.status = status
    #     self.date = date

class OrderCount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    count = db.Column(db.Integer)
    house_id = db.Column(db.Integer, db.ForeignKey('house.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))

    def __init__(self, count, house_id, order_id):
        self.count = count
        self.house_id = house_id
        self.order_id  = order_id


class UserForm(FlaskForm):
    name = StringField('Имя', validators=[DataRequired()])
    contact = StringField('Контакты', validators=[DataRequired()])
    age = IntegerField('Возраст', validators=[DataRequired()])
    button = SubmitField('Отправить')

class HouseForm(FlaskForm):
    user = SelectMultipleField('Пользователь', choices=to_choices(), validators=[DataRequired()], default=to_choices()[0])
    street = StringField('Улица', validators=[DataRequired()])
    dom = IntegerField('Дом', validators=[DataRequired()])
    kv = IntegerField('Квартира', validators=[DataRequired()])
    button = SubmitField('Отправить')



@app.route('/users/', methods=['GET', 'POST'])
def users():
    form = UserForm()
    if form.validate_on_submit():
        # print(form.name.data)
        user = User(form.name.data, form.contact.data, form.age.data)
        db.session.add(user)
        db.session.commit()
        # zapros = User.query.all()
        # print(json.dump(zapros))
        return redirect(url_for('users'))
    return render_template('users.html', form=form)

@app.route('/house/', methods=['GET', 'POST'])
def house():
    form = HouseForm()
    if form.validate_on_submit():
        # print(form.user.data[0])
        # print(User.query.filter_by(name=form.user.data[0]).first().id)
        house = House(form.street.data, form.dom.data, form.kv.data, User.query.filter_by(name=form.user.data[0]).first().id)
        db.session.add(house)
        db.session.commit()
        return redirect(url_for('house'))
    return render_template('house.html', form=form)

@app.route('/json/', methods=['GET', 'POST'])
@as_json
def otvet():
    z = [u.to_json() for u in User.query.all()]
    return z


@app.route('/jsonv2/', methods=['GET', 'POST'])
def otv():
    z = [u.to_json() for u in User.query.all()]
    return jsonify(result=z)


@app.route('/cart/')
def cart():
    return render_template('cart.html')


@app.route('/menu/')
def menu():
    users = User.query.all()
    return render_template('m_menu.html', users=users)


@app.route('/savemenu/', methods=['GET', 'POST'])
def savemenu():
    data = request.get_json(force=True)
    print(data)
    order = Order()
    db.session.add(order)
    db.session.commit()
    for d in data:
        order_count = OrderCount(d['count'], d['id'], order.id)
        db.session.add(order_count)
        db.session.commit()

    return render_template('ok.html')

@app.route('/')
def index():
    user_agent = request.headers.get('User-Agent')
    return "Hello %s" % user_agent

if __name__ == '__main__':
    # db.drop_all()
    db.create_all()
    app.run(debug=True)
