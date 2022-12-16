'''
agent_utils.py contiene una clase {AgentServer} que sirve a los Agentes
y una función sortH() que es necesaria para ordenar los valores de la lista por heurística
'''
import numpy as np
from math import fabs

class AgentServer():
    def __init__(self, adjMatrix, positions,start_state, goalNode, heuristics=None):
        # adjMatrix es una lista nxn
        self.adjMatrix = np.array(adjMatrix)
        # positions es una lista de tamaño n*2 (x,y)
        self.positions = np.array(positions)
        # goalNodes es el array que contiene todos los nodos
        self.goalNodes = goalNode
        self.start_state = start_state
        self.manhattan = False
        if -1 not in heuristics:
            self.heuristics = np.array(heuristics)
        else:
            self.manhattan = True

    def get_neighbours(self, curState):
        # curState debe ser un número entero que indique el número de estado
        return self.adjMatrix[curState]       
        
    def get_node_value(self, curState):
        # curState debe ser un número entero que indique el número de estado
        if not self.manhattan:
            return self.heuristics[curState]
        p1 = self.positions[curState]
        h = []
        for g in self.goalNodes:
            x = self.positions[g][0]
            y = self.positions[g][1]
            h.append((fabs(p1[0]-x)+fabs(p1[1]-y))/1000)
        return min(h)

    def isConsistent(self):
        for f, t in enumerate(self.adjMatrix):
            for i, a in enumerate(t):
                if(a != 0):
                    if (self.get_node_value(f) - self.get_node_value(i)) > a:
                        return False
        return True

    def isGoal(self, curState):
        return curState in self.goalNodes

def sortH(a):
    return a.h