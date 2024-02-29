import tkinter as tk
from tkinter import *
import time
import sys

formulaeWelcome = tk.Label(text = 'Welcome to the Math Formulae Calculator')
formulaeWelcome.pack()

formulaeUsage = tk.Label(text = "Usage: Click your formula's category to find it.")
formulaeUsage.pack()

exitFormCalc = tk.Button(text = 'Exit', command = exit)
exitFormCalc.pack()

PyrandConeFormula = tk.Label(text = '𝑉 = 1/3𝑏 × ℎ')
CylinderFormula = tk.Label(text = '𝑉 = 𝜋𝑟^2 × ℎ')
SphereFormula = tk.Label(text = '𝑉 = 4/3𝜋𝑟^3')
RPrismFormula = tk.Label(text = '𝑉 = 𝑙 × 𝑤 × ℎ')
PrismFormula = tk.Label(text = '𝑉 = 𝑏 × ℎ')
CubeFormula = tk.Label(text = '𝑉 = 𝑠^3')

def ifDoneVolButtonClick():
    SphereFormula.pack_forget()
    PyrandConeFormula.pack_forget()
    PrismFormula.pack_forget()
    CylinderFormula.pack_forget()
    CubeFormula.pack_forget()
    RPrismFormula.pack_forget()
    volCube.pack()
    volRPrism.pack()
    volPrism.pack()
    volPyrandCone.pack()
    volSphere.pack()
    volCyl.pack()
    doneVolButton.pack_forget()

doneVolButton = tk.Button(text = 'Done', command = ifDoneVolButtonClick)

def ifVolSphereClick():
    SphereFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()
def ifVolPyrandConeClick():
    PyrandConeFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()
def ifVolPrismClick():
    PrismFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()
def ifVolRPrismClick():
    RPrismFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()
def ifVolCubeClick():
    CubeFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()
def ifVolCylinderClick():
    CylinderFormula.pack()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volCube.pack_forget()
    doneVolButton.pack()


volSphere = tk.Button(text = 'The Volume of a Sphere', command = ifVolSphereClick)
volPyrandCone = tk.Button(text = "The Volume of a Pyramid/Cone", command = ifVolPyrandConeClick)
volPrism = tk.Button(text = "The Volume of a Prism", command = ifVolPrismClick)
volCube = tk.Button(text = "The Volume of a Cube")
volRPrism = tk.Button(text = "The Volume of a Parallelepipid")
volCyl = tk.Button(text = 'The Volume of a Cylinder')

def ifMenuClick():
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()
    volCube.pack_forget()
    volRPrism.pack_forget()
    volPrism.pack_forget()
    volPyrandCone.pack_forget()
    volSphere.pack_forget()
    volCyl.pack_forget()
    volumeButton.pack()
    timeButton.pack()
    algebButton.pack()
    areaButton.pack()
    netButton.pack()

def ifStartClick():
    volumeButton.pack()
    timeButton.pack()
    algebButton.pack()
    areaButton.pack()
    netButton.pack()
    startButton.pack_forget()

def ifVolumeClick():
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()
    volCube.pack()
    volRPrism.pack()
    volPrism.pack()
    volPyrandCone.pack()
    volSphere.pack()
    volCyl.pack()

def ifTimeClick():
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()
def ifAlgebClick():  
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()
def ifAreaClick():
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()
def ifNetClick():
    volumeButton.pack_forget()
    timeButton.pack_forget()
    algebButton.pack_forget()
    areaButton.pack_forget()
    netButton.pack_forget()

    
volumeButton = tk.Button(text = "Volume", command = ifVolumeClick)
timeButton = tk.Button(text = "Time", command = ifTimeClick)
algebButton = tk.Button(text = "Algebraic", command = ifAlgebClick)
areaButton = tk.Button(text = "Area", command = ifAreaClick)
netButton = tk.Button(text = "Nets", command = ifNetClick)

menuEntry = tk.Button(text = "Menu", command = ifMenuClick)
menuEntry.pack()

startButton = tk.Button(text = "Start", command = ifStartClick)
startButton.pack()








