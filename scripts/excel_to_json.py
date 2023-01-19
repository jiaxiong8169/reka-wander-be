import pandas as pd
import numpy as np
from datetime import datetime

xls = pd.ExcelFile('data.xlsx')

# interests
df = pd.read_excel(xls, 'interests')
df = df.fillna('')
df.to_json("data/interests.json", orient='records')

# users
df = pd.read_excel(xls, 'users')
df = df.fillna('')
df["role"] = "user"
df["phoneNumber"] = ""
df["email"] = df["name"] + "8169@gmail.com"
df["password"] = ""
df["profileSrc"] = ""
df["trips"] = np.empty((len(df), 0)).tolist()
df["markedGuides"] = np.empty((len(df), 0)).tolist()
df["currentHashedRefreshToken"] = ""
df.to_json("data/users.json", orient='records')

# attractions
df = pd.read_excel(xls, 'attractions')
df = df.fillna('')
df["rateCount"] = 0
df["rateValue"] = 0
df["avgRating"] = 0
df["reviews"] = np.empty((len(df), 0)).tolist()
df["shares"] = np.empty((len(df), 0)).tolist()
df["likes"] = np.empty((len(df), 0)).tolist()
df.to_json("data/attractions.json", orient='records')

# restaurants
df = pd.read_excel(xls, 'restaurants')
df = df.fillna('')
df["rateCount"] = 0
df["rateValue"] = 0
df["avgRating"] = 0
df["reviews"] = np.empty((len(df), 0)).tolist()
df["shares"] = np.empty((len(df), 0)).tolist()
df["likes"] = np.empty((len(df), 0)).tolist()
df.to_json("data/restaurants.json", orient='records')

# hotels
df = pd.read_excel(xls, 'hotels')
df = df.fillna('')
df["rateCount"] = 0
df["rateValue"] = 0
df["avgRating"] = 0
df["kids"] = True
df["reviews"] = np.empty((len(df), 0)).tolist()
df["shares"] = np.empty((len(df), 0)).tolist()
df["likes"] = np.empty((len(df), 0)).tolist()
df.to_json("data/hotels.json", orient='records')

# homestays
df = pd.read_excel(xls, 'homestays')
df = df.fillna('')
df["kids"] = True
df.to_json("data/homestays.json", orient='records')

# vehicles
df = pd.read_excel(xls, 'vehicles')
df = df.fillna('')
df["kids"] = True
df.to_json("data/vehicles.json", orient='records')

# guides
df = pd.read_excel(xls, 'guides')
df = df.fillna('')
df["rateCount"] = 0
df["rateValue"] = 0
df["avgRating"] = 0
df["timestamp"] = datetime.now()
df["reviews"] = np.empty((len(df), 0)).tolist()
df["shares"] = np.empty((len(df), 0)).tolist()
df["likes"] = np.empty((len(df), 0)).tolist()
df.to_json("data/guides.json", orient='records')

# rooms
df = pd.read_excel(xls, 'rooms')
df = df.fillna('')
df.to_json("data/rooms.json", orient='records')

# packages
df = pd.read_excel(xls, 'packages')
df = df.fillna('')
df.to_json("data/packages.json", orient='records')
