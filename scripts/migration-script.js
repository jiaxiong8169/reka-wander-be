for (let i = 0; i < data.length; i++) {
  const { patientCode, icNumber, clinicType } = data[i];
  const updateResult = db.patients.updateMany(
    {
      patientCode: String(patientCode),
      $or: [
        { "patientIC.newIC": icNumber },
        { "patientIC.oldIC": icNumber },
        { "patientIC.armyPoliceIC": icNumber },
      ],
    },
    { $set: { clinicType } }
  );
  if (updateResult.modifiedCount === 0)
    print(patientCode + "," + icNumber + "," + clinicType);
}
