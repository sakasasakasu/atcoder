#include <bits/stdc++.h>
using namespace std; 

int main() {
    long long N, K;
    cin >> N >> K;

    vector<long long> L(N);
    vector<vector<int>> A(N);
    for (int i = 0; i < N; i++) {
        cin >> L.at(i);
        A.at(i).resize(L.at(i));
        for (int j = 0; j < L.at(i); j++) {
            cin >> A.at(i).at(j);
        }
    }

    vector<long long> C(N);
    for (int i = 0; i < N; i++) {
        cin >> C.at(i);
    }

    long long total_length = 0;
    for (int i =0; i < N; i++) {
        //配列の長さ
        long long length = L.at(i) * C.at(i);

        if (K <= length + total_length) {
            long long num = K - total_length - 1;
            cout << A.at(i).at(num % L.at(i)) << endl;
            return 0;
        }
        total_length += length;
    }
}
