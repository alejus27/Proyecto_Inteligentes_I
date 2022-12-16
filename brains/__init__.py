'''
El módulo brains devuelve la función [serve] que atiende la solicitud para resolver
los problemas de busqueda
'''
from brains.env_utils import process_graph
from brains.agent_utils import *
from brains.agents import *


def serve(obj):
    l = []
    # extrae la información y prepara el servidor
    graph_dict = process_graph(obj)
    server = AgentServer(
        adjMatrix=graph_dict['adj_matrix'],
        positions=graph_dict['positions'],
        start_state=graph_dict['start'],
        goalNode=graph_dict['goal'],
        heuristics=graph_dict['heuristics']
    )

    # inicializadores
    method = graph_dict['method']
    searcher = None
    if method == 'Greedy':
        searcher = Greedy(server)
    elif method == 'A*':
        searcher = Astar(server)
    elif method == 'BFS':
        searcher = BFS(server)
    elif method == 'DFS':
        searcher = DFS(server)
    else:
        searcher = UCS(server)

    # búsqueda
    path, cost = searcher.search()
    visited = searcher.visited
    start = graph_dict['start']
    goal = graph_dict['goal']

    start_ = int_to_letter(start+1)
    goal_ = [int_to_letter(i+1) if i == i else i for i in goal]
    path_ = [int_to_letter(i+1) if i == i else i for i in path]
    visited_ = [int_to_letter(i+1) if i == i else i for i in visited]

    print('\n\n')
    print("Euristica por defecto (Manhattan):", server.manhattan, '\n')

    print('Inicio: ', start_, '\nFinal: ', goal_, '\nCamino solución: ', path_, '\nLongitud: ', len(path_), '\nCoste: ', cost,
          '\nCamino generado: ', visited_, '\nAlgoritmo: ', method, '\n')

    #l.append(str('Inicio: ' + str(start_) + ' Final: ' + str(goal_) + ' Camino solución: ' + str(path_) + ' Longitud: ' + str(len(path_)) +
             # ' Coste: ' + str(cost)+' Camino generado: ' + str(visited_)+' Algoritmo: ' + str(method)))

    return {
        'path': path,
        'cost': cost,
        'visited': visited,
        'method': method
    }


def int_to_letter(num):
    return (chr(ord('@')+num))
