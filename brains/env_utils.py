'''
El módulo env_utils.py sirve al módulo agent_utils.py proporcionando útiles
funciones que perciben el entorno
'''

import numpy as np

__all__ = ['process_graph']


def get_adj_matrix(connections, graph_type=0):
    '''
    input: lista de conexiones
    graph_type: 0 => dirigido y 1=> no dirigido 
    output:  matriz de adyacencia representada por orden alfabético en filas y columnas
    '''
    n = len(connections)
    adj_matrix = np.zeros((n, n))
    # Hace bucle sobre cada nodo
    for i in range(n):
        # Hace bucle sobre sus conexiones
        for j in range(len(connections[i]['children_nodes'])):
            # Recupera el desplazamiento de la letra desde el carácter 'A'
            displacement = ord(connections[i]['children_nodes'][j])-ord('A')
            # añade el peso respectivo a su índice de desplazamiento en la matriz de adyacencia
            adj_matrix[i][displacement] = connections[i]['weights'][j]

            # añade el espejo del grafo no dirigido si el grafo es no dirigido
            if graph_type:
                adj_matrix[displacement][i] = connections[i]['weights'][j]

    return adj_matrix


def extract_heuristics(connections):
    '''
    inputs: lista de conexiones
    output: lista de heurísticas representadas alfabéticamente
    '''
    return [i['heuristics'] for i in connections]


def process_graph(dic):
    '''
    inputs: toma el diccionario de los parámetros enviados desde el servidor
    output: diccionario con las keys procesadas que son:
        [start,'goal','method','adj_matrix','heuristics']
    '''
    base_letter_encoding = ord('A')
    start, method = ord(dic["start"]) - base_letter_encoding, dic['method']
    goals = [(ord(i)-base_letter_encoding) for i in dic["goal"]]
    print(goals)
    connections = dic['connections']
    is_directed = int(dic['is_undirected']);
    adj_matrix = get_adj_matrix(connections,is_directed)
    heuristics = extract_heuristics(connections)
    positions = [node['pos'] for node in connections]

    return {
        'start': start,
        'goal': goals,
        'method': method,
        'adj_matrix': adj_matrix.tolist(),
        'heuristics': heuristics,
        'positions': positions
    }
