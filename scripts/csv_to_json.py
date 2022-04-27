import pandas as pd
import re

raw_df = pd.read_csv('./migration-data-clinic-type.csv', header=0)

df = raw_df[['Patient Code', 'Patient Name', "IC Number", "Clinic Type"]]

df = df.rename({
    'Patient Code': "patientCode",
    'Patient Name': 'patientName',
    'IC Number': 'icNumber',
    "Clinic Type": "clinicType",
}, axis=1)

df.icNumber.astype('string')

pattern = "\d{6}-\d{2}-\d{4}"

print(df.icNumber.to_list())

faulty_ic = df[~df.icNumber.str.match(pattern)]
faulty_ic  = faulty_ic.icNumber.apply(lambda x: f"{x[0:6]}-{x[6:8]}-{x[8:12]}")

print(faulty_ic)

print(df)

print(sum(~df.icNumber.str.match(pattern)))

# df.to_json('migration_data.json', orient='records')
